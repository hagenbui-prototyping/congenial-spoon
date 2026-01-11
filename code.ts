type PluginVariableData = {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT';
  value: string;
  collectionId?: string;
  collectionName?: string;
  isColorScaleGroup?: boolean;
};

type PluginStyleData = {
  id: string;
  name: string;
  type: 'TEXT' | 'PAINT';
  value: string;
};

type PluginVariableCollectionData = {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  isColorScaleGroup?: boolean;
};

type ColorScaleGroupMetadata = {
  collectionIds: string[];
  variableIds: string[];
};

type ColorScaleAlgorithm = 'tint-shade' | 'hsl-lightness' | 'hsl-saturation' | 'perceptual-lightness';

type ColorScaleConfig = {
  baseColor: string;
  algorithm: ColorScaleAlgorithm;
  steps: number[];
  baseName: string;
  targetCollectionId?: string;
};

type ColorScalePreview = {
  step: number;
  color: string;
  variableName: string;
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
function formatColorValue(value: VariableValue): string {
  if (typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value) {
    if ('a' in value && value.a !== undefined && value.a < 1) {
      return `rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${value.a})`;
    }
    return rgbToHex(value.r, value.g, value.b);
  }
  return String(value);
}

// ===== Plugin Data Management =====

function getColorScaleGroupMetadata(): ColorScaleGroupMetadata {
  const data = figma.root.getPluginData('colorScaleGroups');
  if (!data) {
    return { collectionIds: [], variableIds: [] };
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    return { collectionIds: [], variableIds: [] };
  }
}

function saveColorScaleGroupMetadata(metadata: ColorScaleGroupMetadata): void {
  figma.root.setPluginData('colorScaleGroups', JSON.stringify(metadata));
}

function markAsColorScaleGroup(
  ids: string[],
  markType: 'collection' | 'variable'
): ColorScaleGroupMetadata {
  const metadata = getColorScaleGroupMetadata();

  if (markType === 'collection') {
    ids.forEach(id => {
      if (!metadata.collectionIds.includes(id)) {
        metadata.collectionIds.push(id);
      }
    });
  } else {
    ids.forEach(id => {
      if (!metadata.variableIds.includes(id)) {
        metadata.variableIds.push(id);
      }
    });
  }

  saveColorScaleGroupMetadata(metadata);
  return metadata;
}

function unmarkColorScaleGroup(
  ids: string[],
  markType: 'collection' | 'variable'
): ColorScaleGroupMetadata {
  const metadata = getColorScaleGroupMetadata();

  if (markType === 'collection') {
    metadata.collectionIds = metadata.collectionIds.filter(
      id => !ids.includes(id)
    );
  } else {
    metadata.variableIds = metadata.variableIds.filter(
      id => !ids.includes(id)
    );
  }

  saveColorScaleGroupMetadata(metadata);
  return metadata;
}

// ===== Collection Management =====

async function getLocalCollections(): Promise<PluginVariableCollectionData[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const metadata = getColorScaleGroupMetadata();

  return collections.map(collection => ({
    id: collection.id,
    name: collection.name,
    modes: collection.modes.map(mode => ({
      modeId: mode.modeId,
      name: mode.name
    })),
    isColorScaleGroup: metadata.collectionIds.includes(collection.id)
  }));
}

// Read Variables (Colors and Typography)
async function readVariables(): Promise<PluginVariableData[]> {
  const variables: PluginVariableData[] = [];
  const localVariables = await figma.variables.getLocalVariablesAsync();
  const metadata = getColorScaleGroupMetadata();

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
      const collection = await figma.variables.getVariableCollectionByIdAsync(
        variable.variableCollectionId
      );

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
        collectionId: variable.variableCollectionId,
        collectionName: collection ? collection.name : 'Unknown',
        isColorScaleGroup: metadata.variableIds.includes(variable.id),
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

// ===== Color Scale Generation - Utilities =====

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r, g, b };
}

// ===== Color Scale Algorithms =====

function generateTintShadeScale(baseHex: string, steps: number[]): Map<number, RGB> {
  const base = hexToRgb(baseHex);
  const scale = new Map<number, RGB>();
  const baseStep = 500;

  steps.forEach((step) => {
    if (step === baseStep) {
      scale.set(step, base);
    } else if (step < baseStep) {
      // Tint (mix with white)
      const ratio = (baseStep - step) / baseStep;
      const tintAmount = ratio * 0.95;
      scale.set(step, {
        r: base.r + (1 - base.r) * tintAmount,
        g: base.g + (1 - base.g) * tintAmount,
        b: base.b + (1 - base.b) * tintAmount,
      });
    } else {
      // Shade (mix with black)
      const ratio = (step - baseStep) / (1000 - baseStep);
      const shadeAmount = ratio * 0.85;
      scale.set(step, {
        r: base.r * (1 - shadeAmount),
        g: base.g * (1 - shadeAmount),
        b: base.b * (1 - shadeAmount),
      });
    }
  });

  return scale;
}

function generateHslLightnessScale(baseHex: string, steps: number[]): Map<number, RGB> {
  const baseRgb = hexToRgb(baseHex);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const scale = new Map<number, RGB>();
  const baseStep = 500;

  steps.forEach((step) => {
    if (step === baseStep) {
      scale.set(step, baseRgb);
    } else if (step < baseStep) {
      const ratio = (baseStep - step) / baseStep;
      const newL = baseHsl.l + (0.95 - baseHsl.l) * ratio;
      scale.set(step, hslToRgb(baseHsl.h, baseHsl.s, newL));
    } else {
      const ratio = (step - baseStep) / (1000 - baseStep);
      const newL = baseHsl.l * (1 - ratio * 0.85);
      scale.set(step, hslToRgb(baseHsl.h, baseHsl.s, newL));
    }
  });

  return scale;
}

function generateHslSaturationScale(baseHex: string, steps: number[]): Map<number, RGB> {
  const baseRgb = hexToRgb(baseHex);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const scale = new Map<number, RGB>();
  const baseStep = 500;

  steps.forEach((step) => {
    if (step === baseStep) {
      scale.set(step, baseRgb);
    } else if (step < baseStep) {
      const ratio = (baseStep - step) / baseStep;
      const newL = baseHsl.l + (0.95 - baseHsl.l) * ratio;
      const newS = baseHsl.s * (1 - ratio * 0.4);
      scale.set(step, hslToRgb(baseHsl.h, newS, newL));
    } else {
      const ratio = (step - baseStep) / (1000 - baseStep);
      const newL = baseHsl.l * (1 - ratio * 0.85);
      const newS = Math.min(1, baseHsl.s * (1 + ratio * 0.2));
      scale.set(step, hslToRgb(baseHsl.h, newS, newL));
    }
  });

  return scale;
}

function generatePerceptualScale(baseHex: string, steps: number[]): Map<number, RGB> {
  const baseRgb = hexToRgb(baseHex);
  const scale = new Map<number, RGB>();
  const gamma = 2.2;
  const baseStep = 500;

  const toLinear = (c: number) => Math.pow(c, gamma);
  const fromLinear = (c: number) => Math.pow(c, 1 / gamma);

  const baseLinear = {
    r: toLinear(baseRgb.r),
    g: toLinear(baseRgb.g),
    b: toLinear(baseRgb.b),
  };

  steps.forEach((step) => {
    if (step === baseStep) {
      scale.set(step, baseRgb);
    } else if (step < baseStep) {
      const ratio = (baseStep - step) / baseStep;
      const tintAmount = ratio * 0.95;
      scale.set(step, {
        r: fromLinear(baseLinear.r + (1 - baseLinear.r) * tintAmount),
        g: fromLinear(baseLinear.g + (1 - baseLinear.g) * tintAmount),
        b: fromLinear(baseLinear.b + (1 - baseLinear.b) * tintAmount),
      });
    } else {
      const ratio = (step - baseStep) / (1000 - baseStep);
      const shadeAmount = ratio * 0.85;
      scale.set(step, {
        r: fromLinear(baseLinear.r * (1 - shadeAmount)),
        g: fromLinear(baseLinear.g * (1 - shadeAmount)),
        b: fromLinear(baseLinear.b * (1 - shadeAmount)),
      });
    }
  });

  return scale;
}

function generateColorScale(config: ColorScaleConfig): Map<number, RGB> {
  switch (config.algorithm) {
    case 'tint-shade':
      return generateTintShadeScale(config.baseColor, config.steps);
    case 'hsl-lightness':
      return generateHslLightnessScale(config.baseColor, config.steps);
    case 'hsl-saturation':
      return generateHslSaturationScale(config.baseColor, config.steps);
    case 'perceptual-lightness':
      return generatePerceptualScale(config.baseColor, config.steps);
    default:
      return generateTintShadeScale(config.baseColor, config.steps);
  }
}

// ===== Variable Creation for Color Scale =====

async function createColorScaleVariables(config: ColorScaleConfig): Promise<string[]> {
  const scale = generateColorScale(config);
  const createdIds: string[] = [];

  let collection: VariableCollection;
  if (config.targetCollectionId) {
    const found = await figma.variables.getVariableCollectionByIdAsync(config.targetCollectionId);
    if (!found) {
      throw new Error('Target collection not found');
    }
    collection = found;
  } else {
    collection = figma.variables.createVariableCollection(`${config.baseName} Color Scale`);
  }

  const modeId = collection.modes[0].modeId;

  for (const [step, rgb] of scale.entries()) {
    const variableName = `${config.baseName}/${step}`;

    const existingVars = await figma.variables.getLocalVariablesAsync();
    let variable = existingVars.find(
      (v) => v.name === variableName && v.variableCollectionId === collection.id
    );

    if (!variable) {
      const collectionObj = await figma.variables.getVariableCollectionByIdAsync(collection.id);
      if (!collectionObj) {
        throw new Error(`Collection not found: ${collection.id}`);
      }
      variable = figma.variables.createVariable(variableName, collectionObj, 'COLOR');
    }

    variable.setValueForMode(modeId, rgb);
    createdIds.push(variable.id);
  }

  return createdIds;
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
  collectionId?: string;
  markType?: 'collection' | 'variable';
  factor?: number;
  colorScaleConfig?: ColorScaleConfig;
}) => {
  try {
    if (msg.type === 'read-data') {
      const variables = await readVariables();
      const styles = await readStyles();
      const collections = await getLocalCollections();
      const colorScaleMetadata = getColorScaleGroupMetadata();

      figma.ui.postMessage({
        type: 'data-loaded',
        variables,
        styles,
        collections,
        colorScaleMetadata,
      });
    } else if (msg.type === 'get-collections') {
      const collections = await getLocalCollections();
      figma.ui.postMessage({
        type: 'collections-loaded',
        collections,
      });
    } else if (msg.type === 'mark-color-scale-group') {
      const metadata = markAsColorScaleGroup(
        msg.variableIds || [msg.collectionId!],
        msg.markType!
      );

      const variables = await readVariables();
      const collections = await getLocalCollections();

      figma.ui.postMessage({
        type: 'color-scale-group-updated',
        variables,
        collections,
        colorScaleMetadata: metadata,
      });
    } else if (msg.type === 'unmark-color-scale-group') {
      const metadata = unmarkColorScaleGroup(
        msg.variableIds || [msg.collectionId!],
        msg.markType!
      );

      const variables = await readVariables();
      const collections = await getLocalCollections();

      figma.ui.postMessage({
        type: 'color-scale-group-updated',
        variables,
        collections,
        colorScaleMetadata: metadata,
      });
    } else if (msg.type === 'update-variable') {
      const success = await updateVariable(msg.id!, msg.value!);

      if (success) {
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

      const variables = await readVariables();
      figma.ui.postMessage({
        type: 'variables-scaled',
        variables,
        successCount,
      });
    } else if (msg.type === 'preview-color-scale') {
      const scale = generateColorScale(msg.colorScaleConfig!);
      const previews: ColorScalePreview[] = [];

      for (const [step, rgb] of scale.entries()) {
        previews.push({
          step,
          color: rgbToHex(rgb.r, rgb.g, rgb.b),
          variableName: `${msg.colorScaleConfig!.baseName}/${step}`,
        });
      }

      figma.ui.postMessage({
        type: 'data-loaded',
        colorScalePreviews: previews,
      });
    } else if (msg.type === 'generate-color-scale') {
      const createdIds = await createColorScaleVariables(msg.colorScaleConfig!);

      const variables = await readVariables();
      const collections = await getLocalCollections();

      figma.ui.postMessage({
        type: 'color-scale-generated',
        variables,
        collections,
        createdVariableIds: createdIds,
        successCount: createdIds.length,
      });
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
