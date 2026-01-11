import { VariableData } from '../types';
import { VariablesTableGrouped } from './VariablesTableGrouped';

interface CollapsibleVariableSubGroupProps {
  groupName: string;
  variables: VariableData[];
  expanded: boolean;
  selected: boolean;
  onToggleExpanded: () => void;
  onToggleSelection: (id: string) => void;
  onUpdateVariable: (id: string, value: string) => void;
  onSelectGroup: () => void;
}

export function CollapsibleVariableSubGroup({
  groupName,
  variables,
  expanded,
  selected,
  onToggleExpanded,
  onToggleSelection,
  onUpdateVariable,
  onSelectGroup,
}: CollapsibleVariableSubGroupProps) {
  const colorVariables = variables.filter((v) => v.type === 'COLOR');
  const floatVariables = variables.filter((v) => v.type === 'FLOAT');

  return (
    <div className={`rounded border ml-6 mb-2 ${selected ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
      {/* Group Header */}
      <div className="flex items-center justify-between p-2 hover:bg-muted/30 transition-colors">
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={onToggleExpanded}
        >
          {/* Chevron icon */}
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>

          <h4 className="font-medium text-sm">{groupName}</h4>

          <span className="text-xs text-muted-foreground">
            ({colorVariables.length} colors
            {floatVariables.length > 0 && `, ${floatVariables.length} typography`})
          </span>
        </div>

        {/* Radio button for selecting this group as color scale base */}
        <div className="flex items-center gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              checked={selected}
              onChange={onSelectGroup}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground">Scale Base</span>
          </label>
        </div>
      </div>

      {/* Collapsible Content */}
      {expanded && (
        <div className="border-t">
          <VariablesTableGrouped
            variables={variables}
            onToggleSelection={onToggleSelection}
            onUpdateVariable={onUpdateVariable}
          />
        </div>
      )}
    </div>
  );
}
