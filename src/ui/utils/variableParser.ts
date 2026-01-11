// Parse variable names to extract collection/group/variable structure
// Example: "Primary/Blue/500" -> { group: "Blue", variable: "500" }

export interface ParsedVariable {
  originalName: string;
  group: string | null;
  variable: string;
}

export function parseVariableName(name: string): ParsedVariable {
  const parts = name.split('/');

  if (parts.length >= 2) {
    // Has at least collection/variable or collection/group/variable
    const variable = parts[parts.length - 1];
    const group = parts.length >= 2 ? parts[parts.length - 2] : null;

    return {
      originalName: name,
      group,
      variable,
    };
  }

  // No slash, treat entire name as variable with no group
  return {
    originalName: name,
    group: null,
    variable: name,
  };
}

export interface GroupedVariables {
  groupName: string;
  variables: any[];
}

export function groupVariablesByGroup(variables: any[]): GroupedVariables[] {
  const grouped = new Map<string, any[]>();

  variables.forEach((variable) => {
    const parsed = parseVariableName(variable.name);
    const groupName = parsed.group || 'Ungrouped';

    if (!grouped.has(groupName)) {
      grouped.set(groupName, []);
    }
    grouped.get(groupName)!.push({
      ...variable,
      parsedName: parsed,
    });
  });

  // Convert to array and sort by group name
  return Array.from(grouped.entries())
    .map(([groupName, variables]) => ({
      groupName,
      variables,
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName));
}

// Validate if a group follows color scale format (numeric steps like 50, 100, 200, etc.)
export interface ColorScaleValidation {
  isValid: boolean;
  expectedFormat: string;
  issues: string[];
  suggestedSteps?: number[];
}

export function validateColorScaleFormat(
  variables: any[]
): ColorScaleValidation {
  const issues: string[] = [];

  // Check if all variables are COLOR type
  const nonColorVars = variables.filter((v) => v.type !== 'COLOR');
  if (nonColorVars.length > 0) {
    issues.push(`Contains ${nonColorVars.length} non-color variable(s)`);
  }

  // Parse variable names to extract step numbers
  const steps: number[] = [];
  const invalidNames: string[] = [];

  variables.forEach((v) => {
    const parsed = parseVariableName(v.name);
    const stepNum = parseInt(parsed.variable, 10);

    if (isNaN(stepNum)) {
      invalidNames.push(v.name);
    } else {
      steps.push(stepNum);
    }
  });

  if (invalidNames.length > 0) {
    issues.push(`${invalidNames.length} variable(s) with non-numeric names: ${invalidNames.slice(0, 3).join(', ')}${invalidNames.length > 3 ? '...' : ''}`);
  }

  // Check if steps follow a reasonable scale pattern
  if (steps.length > 0) {
    const sortedSteps = [...steps].sort((a, b) => a - b);
    const hasCommonScale = sortedSteps.every(
      (s) => s >= 50 && s <= 900 && s % 50 === 0
    );

    if (!hasCommonScale) {
      issues.push('Steps do not follow standard scale format (50, 100, 200, ..., 900)');
    }
  }

  const isValid = issues.length === 0 && variables.length > 0;
  const suggestedSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  return {
    isValid,
    expectedFormat: 'GroupName/[50-900] (e.g., Primary/500)',
    issues,
    suggestedSteps: isValid ? undefined : suggestedSteps,
  };
}
