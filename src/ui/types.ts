export interface VariableData {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT';
  value: string;
  rawValue?: any;
  selected?: boolean;
}

export interface StyleData {
  id: string;
  name: string;
  type: 'TEXT' | 'PAINT';
  value: string;
  description?: string;
}

export interface PluginMessage {
  type: 'read-data' | 'data-loaded' | 'update-variable' | 'variable-updated' | 'scale-typography' | 'variables-scaled' | 'error';
  variables?: VariableData[];
  styles?: StyleData[];
  id?: string;
  value?: string;
  variableIds?: string[];
  factor?: number;
  successCount?: number;
  message?: string;
}
