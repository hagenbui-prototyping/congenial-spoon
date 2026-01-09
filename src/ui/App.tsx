import { useEffect, useState } from 'react';
import { VariableData, StyleData, PluginMessage } from './types';
import { VariablesTable } from './components/VariablesTable';
import { StylesTable } from './components/StylesTable';
import { ScaleTypographyDialog } from './components/ScaleTypographyDialog';
import { Button } from './components/ui/button';

function App() {
  const [variables, setVariables] = useState<VariableData[]>([]);
  const [styles, setStyles] = useState<StyleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);

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
        setLoading(false);
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

  const selectedVariables = variables.filter((v) => v.selected);
  const selectedCount = selectedVariables.length;
  const hasTypographySelected = selectedVariables.some((v) => v.type === 'FLOAT');

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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Varpro</h1>
          <p className="text-sm text-muted-foreground">
            Variables and Styles Manager
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Variables</h2>

            {/* Toolbar */}
            {selectedCount > 0 && (
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted p-3">
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

            <VariablesTable
              variables={variables}
              onToggleSelection={handleToggleSelection}
              onToggleSelectAll={handleToggleSelectAll}
              onUpdateVariable={handleUpdateVariable}
            />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Styles</h2>
            <StylesTable styles={styles} />
          </div>
        </div>
      </div>

      <ScaleTypographyDialog
        open={scaleDialogOpen}
        onOpenChange={setScaleDialogOpen}
        selectedVariables={selectedVariables}
        onScale={handleScaleTypography}
      />
    </div>
  );
}

export default App;
