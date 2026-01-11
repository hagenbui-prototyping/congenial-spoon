import { VariableData, VariableCollectionData } from '../types';
import { groupVariablesByGroup } from '../utils/variableParser';

interface VariablesSidebarProps {
  variables: VariableData[];
  collections: VariableCollectionData[];
  selectedGroupKey: string | null;
  onSelectGroup: (collectionId: string, groupName: string) => void;
  onSelectAll: () => void;
}

export function VariablesSidebar({
  variables,
  collections,
  selectedGroupKey,
  onSelectGroup,
  onSelectAll,
}: VariablesSidebarProps) {
  // Group all variables to show in sidebar
  const allGroupedVars = groupVariablesByGroup(variables);

  // Calculate total count
  const totalCount = variables.length;

  return (
    <div className="w-80 border-r bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Collections</h3>
      </div>

      {/* Collections & Groups List */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {/* All Variables */}
        <button
          onClick={onSelectAll}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
            selectedGroupKey === null ? 'bg-primary/10 text-primary' : ''
          }`}
        >
          <span>All</span>
          <span className="text-xs text-muted-foreground">{totalCount}</span>
        </button>

        {/* Collections */}
        {collections.map((collection) => {
          const collectionVariables = variables.filter(
            (v) => v.collectionId === collection.id
          );
          const groupedInCollection = groupVariablesByGroup(collectionVariables);

          if (collectionVariables.length === 0) return null;

          return (
            <div key={collection.id} className="border-b">
              {/* Collection Header */}
              <div className="px-3 py-2 bg-muted/30">
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>{collection.name}</span>
                  <span className="text-muted-foreground">
                    {collectionVariables.length}
                  </span>
                </div>
              </div>

              {/* Groups in this collection */}
              <div>
                {groupedInCollection.map((group) => {
                  const groupKey = `${collection.id}:${group.groupName}`;
                  const isSelected = selectedGroupKey === groupKey;

                  return (
                    <button
                      key={groupKey}
                      onClick={() => onSelectGroup(collection.id, group.groupName)}
                      className={`w-full px-6 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <span>{group.groupName}</span>
                      <span className="text-xs text-muted-foreground">
                        {group.variables.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Ungrouped (if no collections) */}
        {collections.length === 0 && allGroupedVars.length > 0 && (
          <div className="border-b">
            <div className="px-3 py-2 bg-muted/30">
              <div className="text-xs font-semibold">Groups</div>
            </div>
            {allGroupedVars.map((group) => {
              const groupKey = `ungrouped:${group.groupName}`;
              const isSelected = selectedGroupKey === groupKey;

              return (
                <button
                  key={groupKey}
                  onClick={() => onSelectGroup('ungrouped', group.groupName)}
                  className={`w-full px-6 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span>{group.groupName}</span>
                  <span className="text-xs text-muted-foreground">
                    {group.variables.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
