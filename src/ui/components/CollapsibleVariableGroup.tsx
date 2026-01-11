import { useState } from 'react';
import { VariableData, VariableCollectionData } from '../types';
import { Button } from './ui/button';
import { CollapsibleVariableSubGroup } from './CollapsibleVariableSubGroup';
import { groupVariablesByGroup } from '../utils/variableParser';

interface CollapsibleVariableGroupProps {
  collection: VariableCollectionData;
  variables: VariableData[];
  expanded: boolean;
  selectedGroupKey: string | null;
  onToggleExpanded: () => void;
  onToggleSelection: (id: string) => void;
  onUpdateVariable: (id: string, value: string) => void;
  onMarkAsColorScaleGroup: () => void;
  onUnmarkColorScaleGroup: () => void;
  onGenerateColorScale: () => void;
  onSelectGroup: (collectionId: string, groupName: string) => void;
}

export function CollapsibleVariableGroup({
  collection,
  variables,
  expanded,
  selectedGroupKey,
  onToggleExpanded,
  onToggleSelection,
  onUpdateVariable,
  onMarkAsColorScaleGroup,
  onUnmarkColorScaleGroup,
  onGenerateColorScale,
  onSelectGroup,
}: CollapsibleVariableGroupProps) {
  const colorVariables = variables.filter((v) => v.type === 'COLOR');
  const floatVariables = variables.filter((v) => v.type === 'FLOAT');

  // Group variables by their group name (extracted from variable name)
  const groupedVariables = groupVariablesByGroup(variables);

  // Track expanded state for sub-groups
  const [expandedSubGroups, setExpandedSubGroups] = useState<Set<string>>(new Set());

  const handleToggleSubGroup = (groupName: string) => {
    setExpandedSubGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  return (
    <div className="rounded-lg border bg-card mb-3">
      {/* Collection Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          {/* Chevron icon */}
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>

          <h3 className="font-semibold">{collection.name}</h3>

          {collection.isColorScaleGroup && (
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Color Scale Group
            </span>
          )}

          <span className="text-xs text-muted-foreground">
            ({colorVariables.length} colors, {floatVariables.length} typography)
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {collection.isColorScaleGroup ? (
            <Button size="sm" variant="outline" onClick={onUnmarkColorScaleGroup}>
              Unmark
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onMarkAsColorScaleGroup}>
              Mark as Color Scale
            </Button>
          )}

          <Button size="sm" onClick={onGenerateColorScale}>
            Generate Scale
          </Button>
        </div>
      </div>

      {/* Collapsible Content - Nested Groups */}
      {expanded && (
        <div className="border-t p-3 space-y-2">
          {groupedVariables.map((group) => {
            const groupKey = `${collection.id}:${group.groupName}`;
            return (
              <CollapsibleVariableSubGroup
                key={groupKey}
                groupName={group.groupName}
                variables={group.variables}
                expanded={expandedSubGroups.has(group.groupName)}
                selected={selectedGroupKey === groupKey}
                onToggleExpanded={() => handleToggleSubGroup(group.groupName)}
                onToggleSelection={onToggleSelection}
                onUpdateVariable={onUpdateVariable}
                onSelectGroup={() => onSelectGroup(collection.id, group.groupName)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
