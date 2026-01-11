// Collection data structure
export interface VariableCollectionData {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  isColorScaleGroup?: boolean;
}

export interface VariableData {
  id: string;
  name: string;
  type: 'COLOR' | 'FLOAT';
  value: string;
  rawValue?: { r: number; g: number; b: number; a?: number } | number;
  selected?: boolean;
  collectionId?: string;
  collectionName?: string;
  isColorScaleGroup?: boolean;
}

export interface StyleData {
  id: string;
  name: string;
  type: 'TEXT' | 'PAINT';
  value: string;
  description?: string;
}

// Color scale types
export type ColorScaleAlgorithm =
  | 'tint-shade'
  | 'hsl-lightness'
  | 'hsl-saturation'
  | 'perceptual-lightness';

export interface ColorScaleConfig {
  baseColor: string;
  algorithm: ColorScaleAlgorithm;
  steps: number[];
  baseName: string;
  targetCollectionId?: string;
}

export interface ColorScalePreview {
  step: number;
  color: string;
  variableName: string;
}

export interface ColorScaleGroupMetadata {
  collectionIds: string[];
  variableIds: string[];
}

export interface PluginMessage {
  type:
    | 'read-data'
    | 'data-loaded'
    | 'update-variable'
    | 'variable-updated'
    | 'scale-typography'
    | 'variables-scaled'
    | 'error'
    | 'get-collections'
    | 'collections-loaded'
    | 'mark-color-scale-group'
    | 'unmark-color-scale-group'
    | 'color-scale-group-updated'
    | 'generate-color-scale'
    | 'color-scale-generated'
    | 'preview-color-scale';
  variables?: VariableData[];
  styles?: StyleData[];
  collections?: VariableCollectionData[];
  colorScaleMetadata?: ColorScaleGroupMetadata;
  id?: string;
  value?: string;
  variableIds?: string[];
  collectionId?: string;
  markType?: 'collection' | 'variable';
  factor?: number;
  successCount?: number;
  message?: string;
  colorScaleConfig?: ColorScaleConfig;
  colorScalePreviews?: ColorScalePreview[];
  createdVariableIds?: string[];
}
