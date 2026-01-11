import { useEffect, useState } from 'react';
import {
  VariableData,
  StyleData,
  PluginMessage,
  VariableCollectionData,
  ColorScaleGroupMetadata,
  ColorScaleConfig,
  ColorScalePreview,
} from './types';
import { VariablesTable } from './components/VariablesTable';
import { StylesTable } from './components/StylesTable';
import { ScaleTypographyDialog } from './components/ScaleTypographyDialog';
import { ColorScaleGeneratorDialog } from './components/ColorScaleGeneratorDialog';
import { ReformatGroupDialog } from './components/ReformatGroupDialog';
import { VariablesSidebar } from './components/VariablesSidebar';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { groupVariablesByGroup, validateColorScaleFormat } from './utils/variableParser';

function App() {
  const [variables, setVariables] = useState<VariableData[]>([]);
  const [styles, setStyles] = useState<StyleData[]>([]);
  const [collections, setCollections] = useState<VariableCollectionData[]>([]);
  const [_colorScaleMetadata, _setColorScaleMetadata] = useState<ColorScaleGroupMetadata>({
    collectionIds: [],
    variableIds: [],
  });
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
  const [colorScaleDialogOpen, setColorScaleDialogOpen] = useState(false);
  const [selectedCollectionForScale, setSelectedCollectionForScale] = useState<string | undefined>(undefined);
  const [colorScalePreviews, setColorScalePreviews] = useState<ColorScalePreview[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [reformatDialogOpen, setReformatDialogOpen] = useState(false);
  const [reformatGroupData, setReformatGroupData] = useState<{
    collectionId: string;
    groupName: string;
    variables: VariableData[];
    validation: ReturnType<typeof validateColorScaleFormat>;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('variables');

  useEffect(() => {
    // Request data from plugin on mount
    parent.postMessage({ pluginMessage: { type: 'read-data' } }, '*');

    // Listen for data from plugin
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as PluginMessage;
      if (!msg) return;

      if (msg.type === 'data-loaded') {
        setVariables(msg.variables || []);
        setStyles(msg.styles || []);
        setCollections(msg.collections || []);
        _setColorScaleMetadata(msg.colorScaleMetadata || { collectionIds: [], variableIds: [] });
        if (msg.colorScalePreviews) {
          setColorScalePreviews(msg.colorScalePreviews);
        }
        setLoading(false);
      } else if (msg.type === 'collections-loaded') {
        setCollections(msg.collections || []);
      } else if (msg.type === 'color-scale-group-updated') {
        setVariables(msg.variables || []);
        setCollections(msg.collections || []);
        _setColorScaleMetadata(msg.colorScaleMetadata || { collectionIds: [], variableIds: [] });
      } else if (msg.type === 'color-scale-generated') {
        setVariables(msg.variables || []);
        setCollections(msg.collections || []);
        console.log(`Generated ${msg.successCount} color scale variables`);
      } else if (msg.type === 'variable-updated' || msg.type === 'variables-scaled') {
        // Preserve selection state when updating
        setVariables((prevVariables) => {
          const selectedIds = new Set(prevVariables.filter((v) => v.selected).map((v) => v.id));
          return (msg.variables || []).map((v) => ({
            ...v,
            selected: selectedIds.has(v.id),
          }));
        });

        if (msg.type === 'variables-scaled') {
          console.log(`Scaled ${msg.successCount} variables`);
        }
      } else if (msg.type === 'error') {
        console.error('Plugin error:', msg.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleToggleSelection = (id: string) => {
    setVariables((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = variables.every((v) => v.selected);
    setVariables((prev) => prev.map((v) => ({ ...v, selected: !allSelected })));
  };

  const handleDeselectAll = () => {
    setVariables((prev) => prev.map((v) => ({ ...v, selected: false })));
  };

  const handleUpdateVariable = (id: string, value: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'update-variable',
          id,
          value,
        },
      },
      '*'
    );
  };

  const handleScaleTypography = (factor: number) => {
    const selectedTypographyVars = selectedVariables.filter(
      (v) => v.type === 'FLOAT'
    );
    const ids = selectedTypographyVars.map((v) => v.id);

    parent.postMessage(
      {
        pluginMessage: {
          type: 'scale-typography',
          variableIds: ids,
          factor,
        },
      },
      '*'
    );
  };

  const handleToggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const handleMarkAsColorScaleGroup = (collectionId: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'mark-color-scale-group',
          collectionId,
          markType: 'collection',
        },
      },
      '*'
    );
  };

  const handleUnmarkColorScaleGroup = (collectionId: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'unmark-color-scale-group',
          collectionId,
          markType: 'collection',
        },
      },
      '*'
    );
  };

  const handleGenerateColorScale = (collectionId: string) => {
    setSelectedCollectionForScale(collectionId);
    setColorScaleDialogOpen(true);
  };

  const handlePreviewColorScale = (config: ColorScaleConfig) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'preview-color-scale',
          colorScaleConfig: config,
        },
      },
      '*'
    );
  };

  const handleGenerateColorScaleConfirm = (config: ColorScaleConfig) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'generate-color-scale',
          colorScaleConfig: config,
        },
      },
      '*'
    );
  };

  const handleSelectGroup = (collectionId: string, groupName: string) => {
    const groupKey = `${collectionId}:${groupName}`;
    console.log('handleSelectGroup called:', { collectionId, groupName, groupKey });
    console.log('Available collections:', collections.map(c => ({ id: c.id, name: c.name })));
    console.log('Variables with collectionIds:', variables.slice(0, 5).map(v => ({ name: v.name, collectionId: v.collectionId })));
    setSelectedGroupKey(groupKey);
  };

  const handleSelectAll = () => {
    setSelectedGroupKey(null);
  };

  const handleGenerateScaleForGroup = () => {
    if (!selectedGroupKey) return;

    const [collectionId, groupName] = selectedGroupKey.split(':');

    // Get variables in this group
    let groupVariables: VariableData[] = [];

    if (collectionId === 'ungrouped') {
      const allGrouped = groupVariablesByGroup(variables);
      const group = allGrouped.find((g) => g.groupName === groupName);
      groupVariables = group ? group.variables : [];
    } else {
      const collectionVariables = variables.filter(
        (v) => v.collectionId === collectionId
      );
      const groupedVars = groupVariablesByGroup(collectionVariables);
      const selectedGroup = groupedVars.find((g) => g.groupName === groupName);
      groupVariables = selectedGroup ? selectedGroup.variables : [];
    }

    if (groupVariables.length > 0) {
      // Validate format
      const validation = validateColorScaleFormat(groupVariables);

      if (!validation.isValid) {
        // Show reformat dialog
        setReformatGroupData({
          collectionId,
          groupName,
          variables: groupVariables,
          validation,
        });
        setReformatDialogOpen(true);
      } else {
        // Format is valid, open color scale dialog
        setSelectedCollectionForScale(collectionId);
        setColorScaleDialogOpen(true);
      }
    }
  };

  const handleReformatGroup = (steps: number[]) => {
    if (!reformatGroupData) return;

    // Get base color from first variable in group
    const firstColorVar = reformatGroupData.variables.find(
      (v) => v.type === 'COLOR'
    );

    if (firstColorVar) {
      const config: ColorScaleConfig = {
        baseColor: firstColorVar.value,
        algorithm: 'tint-shade',
        steps,
        baseName: reformatGroupData.groupName,
        targetCollectionId: reformatGroupData.collectionId,
      };

      // Generate the color scale
      handleGenerateColorScaleConfirm(config);
    }

    setReformatDialogOpen(false);
    setReformatGroupData(null);
  };

  const selectedVariables = variables.filter((v) => v.selected);
  const selectedCount = selectedVariables.length;
  const hasTypographySelected = selectedVariables.some((v) => v.type === 'FLOAT');

  // Filter variables based on selected group
  const filteredVariables = selectedGroupKey
    ? (() => {
        const parts = selectedGroupKey.split(':');
        if (parts.length < 2) {
          console.warn('Invalid selectedGroupKey format:', selectedGroupKey);
          return variables;
        }
        const [collectionId, ...groupNameParts] = parts;
        const groupName = groupNameParts.join(':'); // Handle group names with colons

        if (collectionId === 'ungrouped') {
          const allGrouped = groupVariablesByGroup(variables);
          const group = allGrouped.find((g) => g.groupName === groupName);
          console.log('Ungrouped filter:', { groupName, found: group?.variables.length || 0 });
          return group ? group.variables : [];
        } else {
          const collectionVariables = variables.filter(
            (v) => v.collectionId === collectionId
          );
          console.log('Collection filter:', { collectionId, collectionVars: collectionVariables.length });
          const groupedVars = groupVariablesByGroup(collectionVariables);
          console.log('Grouped vars:', groupedVars.map(g => `${g.groupName} (${g.variables.length})`));
          const selectedGroup = groupedVars.find((g) => g.groupName === groupName);
          console.log('Selected group result:', { groupName, found: selectedGroup?.variables.length || 0 });
          return selectedGroup ? selectedGroup.variables : [];
        }
      })()
    : variables;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Varpro</h1>
            <p className="text-xs text-muted-foreground">
              Variables and Styles Manager
            </p>
          </div>

          {/* Actions */}
          {activeTab === 'variables' && selectedGroupKey && (
            <Button size="sm" onClick={handleGenerateScaleForGroup}>
              Generate Scale
            </Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <TabsList>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
        </TabsList>

        {/* Variables Tab */}
        <TabsContent value="variables">
          <div className="flex h-full">
            {/* Sidebar */}
            <VariablesSidebar
              variables={variables}
              collections={collections}
              selectedGroupKey={selectedGroupKey}
              onSelectGroup={handleSelectGroup}
              onSelectAll={handleSelectAll}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {/* Toolbar */}
              {selectedCount > 0 && (
                <div className="p-3 border-b bg-muted/30 flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {selectedCount} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setScaleDialogOpen(true)}
                    disabled={!hasTypographySelected}
                  >
                    Scale Typography
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              )}

              {/* Variables Table */}
              <div className="flex-1 overflow-auto p-4 min-w-0">
                <VariablesTable
                  variables={filteredVariables}
                  onToggleSelection={handleToggleSelection}
                  onToggleSelectAll={handleToggleSelectAll}
                  onUpdateVariable={handleUpdateVariable}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Styles Tab */}
        <TabsContent value="styles">
          <div className="flex-1 overflow-auto p-4">
            <StylesTable styles={styles} />
          </div>
        </TabsContent>
      </Tabs>

      <ScaleTypographyDialog
        open={scaleDialogOpen}
        onOpenChange={setScaleDialogOpen}
        selectedVariables={selectedVariables}
        onScale={handleScaleTypography}
      />

      <ColorScaleGeneratorDialog
        open={colorScaleDialogOpen}
        onOpenChange={setColorScaleDialogOpen}
        collections={collections}
        initialCollectionId={selectedCollectionForScale}
        onGenerate={handleGenerateColorScaleConfirm}
        onPreview={handlePreviewColorScale}
        previews={colorScalePreviews}
      />

      {reformatGroupData && (
        <ReformatGroupDialog
          open={reformatDialogOpen}
          onOpenChange={setReformatDialogOpen}
          groupName={reformatGroupData.groupName}
          validation={reformatGroupData.validation}
          variableCount={reformatGroupData.variables.length}
          onConfirm={handleReformatGroup}
        />
      )}
    </div>
  );
}

export default App;
