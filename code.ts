type PluginVariableData = {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT';
  value: string;
};

type PluginStyleData = {
  id: string;
  name: string;
  type: 'TEXT' | 'PAINT';
  value: string;
};

// Convert RGB to Hex color
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Format color value from variable
function formatColorValue(value: any): string {
  if (value.r !== undefined && value.g !== undefined && value.b !== undefined) {
    if (value.a !== undefined && value.a < 1) {
      return `rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${value.a})`;
    }
    return rgbToHex(value.r, value.g, value.b);
  }
  return String(value);
}

// Read Variables (Colors and Typography)
async function readVariables(): Promise<PluginVariableData[]> {
  const variables: PluginVariableData[] = [];
  const localVariables = await figma.variables.getLocalVariablesAsync();

  for (const variable of localVariables) {
    const isColorVariable = variable.resolvedType === 'COLOR';
    const isTypographyVariable =
      variable.resolvedType === 'FLOAT' &&
      (variable.name.toLowerCase().includes('font') ||
       variable.name.toLowerCase().includes('text') ||
       variable.name.toLowerCase().includes('size') ||
       variable.name.toLowerCase().includes('line') ||
       variable.name.toLowerCase().includes('spacing') ||
       variable.name.toLowerCase().includes('scale'));

    if (isColorVariable || isTypographyVariable) {
      const modeId = Object.keys(variable.valuesByMode)[0];
      const value = variable.valuesByMode[modeId];

      let formattedValue = '';
      if (isColorVariable) {
        formattedValue = formatColorValue(value);
      } else {
        formattedValue = String(value);
      }

      variables.push({
        id: variable.id,
        name: variable.name,
        type: variable.resolvedType as 'COLOR' | 'FLOAT',
        value: formattedValue,
      });
    }
  }

  return variables;
}

// Read Styles (Text and Color/Paint)
async function readStyles(): Promise<PluginStyleData[]> {
  const styles: PluginStyleData[] = [];

  // Read Text Styles
  const textStyles = await figma.getLocalTextStylesAsync();
  for (const style of textStyles) {
    const fontSize = typeof style.fontSize === 'number' ? style.fontSize : 'Mixed';
    const fontName = typeof style.fontName === 'object' && style.fontName !== null && 'family' in style.fontName
      ? `${style.fontName.family} ${style.fontName.style}`
      : 'Mixed';
    const lineHeight = typeof style.lineHeight === 'object' && style.lineHeight !== null && 'unit' in style.lineHeight
      ? (style.lineHeight.unit === 'PIXELS'
          ? `${style.lineHeight.value}px`
          : style.lineHeight.unit === 'PERCENT'
            ? `${style.lineHeight.value}%`
            : 'Auto')
      : 'Mixed';

    styles.push({
      id: style.id,
      name: style.name,
      type: 'TEXT',
      value: `${fontName} / ${fontSize}${typeof fontSize === 'number' ? 'px' : ''} / ${lineHeight}`,
    });
  }

  // Read Paint/Color Styles
  const paintStyles = await figma.getLocalPaintStylesAsync();
  for (const style of paintStyles) {
    const paints = style.paints;
    let colorValue = 'None';

    if (paints.length > 0) {
      const paint = paints[0];
      if (paint.type === 'SOLID' && 'color' in paint && paint.color) {
        colorValue = rgbToHex(paint.color.r, paint.color.g, paint.color.b);
        if (paint.opacity !== undefined && paint.opacity < 1) {
          colorValue += ` (${Math.round(paint.opacity * 100)}% opacity)`;
        }
      } else if (paint.type === 'GRADIENT_LINEAR') {
        colorValue = 'Linear Gradient';
      } else if (paint.type === 'GRADIENT_RADIAL') {
        colorValue = 'Radial Gradient';
      } else {
        colorValue = paint.type;
      }
    }

    styles.push({
      id: style.id,
      name: style.name,
      type: 'PAINT',
      value: colorValue,
    });
  }

  return styles;
}

// Parse string value back to Figma RGB format
function parseColorValue(value: string): RGB | null {
  // Handle hex format: #RRGGBB
  if (value.startsWith('#')) {
    const hex = value.substring(1);
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      return { r, g, b };
    }
  }

  // Handle rgba format: rgba(r, g, b, a)
  const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]) / 255,
      g: parseInt(rgbaMatch[2]) / 255,
      b: parseInt(rgbaMatch[3]) / 255,
    };
  }

  return null;
}

// Update a single variable
async function updateVariable(id: string, newValue: string): Promise<boolean> {
  try {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (!variable) return false;

    const modeId = Object.keys(variable.valuesByMode)[0];

    if (variable.resolvedType === 'COLOR') {
      const rgb = parseColorValue(newValue);
      if (rgb) {
        variable.setValueForMode(modeId, rgb);
        return true;
      }
    } else if (variable.resolvedType === 'FLOAT') {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        variable.setValueForMode(modeId, numValue);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Update variable error:', error);
    return false;
  }
}

// Scale multiple typography variables
async function scaleTypographyVariables(variableIds: string[], factor: number): Promise<number> {
  let successCount = 0;

  for (const id of variableIds) {
    try {
      const variable = await figma.variables.getVariableByIdAsync(id);
      if (!variable || variable.resolvedType !== 'FLOAT') continue;

      const modeId = Object.keys(variable.valuesByMode)[0];
      const currentValue = variable.valuesByMode[modeId] as number;
      const newValue = currentValue * factor;

      variable.setValueForMode(modeId, newValue);
      successCount++;
    } catch (error) {
      console.error(`Failed to scale variable ${id}:`, error);
    }
  }

  return successCount;
}

// Show UI
figma.showUI(__html__, { width: 800, height: 600 });

// Message handler
figma.ui.onmessage = async (msg: {
  type: string;
  id?: string;
  value?: string;
  variableIds?: string[];
  factor?: number;
}) => {
  if (msg.type === 'read-data') {
    const variables = await readVariables();
    const styles = await readStyles();

    figma.ui.postMessage({
      type: 'data-loaded',
      variables,
      styles,
    });
  } else if (msg.type === 'update-variable') {
    const success = await updateVariable(msg.id!, msg.value!);

    if (success) {
      // Refresh data
      const variables = await readVariables();
      figma.ui.postMessage({
        type: 'variable-updated',
        variables,
      });
    } else {
      figma.ui.postMessage({
        type: 'error',
        message: 'Failed to update variable',
      });
    }
  } else if (msg.type === 'scale-typography') {
    const successCount = await scaleTypographyVariables(msg.variableIds!, msg.factor!);

    // Refresh data
    const variables = await readVariables();
    figma.ui.postMessage({
      type: 'variables-scaled',
      variables,
      successCount,
    });
  }
};
