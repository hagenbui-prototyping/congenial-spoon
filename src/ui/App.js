import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { VariablesTable } from './components/VariablesTable';
import { StylesTable } from './components/StylesTable';
import { ScaleTypographyDialog } from './components/ScaleTypographyDialog';
import { Button } from './components/ui/button';
function App() {
    const [variables, setVariables] = useState([]);
    const [styles, setStyles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
    useEffect(() => {
        // Request data from plugin on mount
        parent.postMessage({ pluginMessage: { type: 'read-data' } }, '*');
        // Listen for data from plugin
        const handleMessage = (event) => {
            const msg = event.data.pluginMessage;
            if (!msg)
                return;
            if (msg.type === 'data-loaded') {
                setVariables(msg.variables || []);
                setStyles(msg.styles || []);
                setLoading(false);
            }
            else if (msg.type === 'variable-updated' || msg.type === 'variables-scaled') {
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
            }
            else if (msg.type === 'error') {
                console.error('Plugin error:', msg.message);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    const handleToggleSelection = (id) => {
        setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v)));
    };
    const handleToggleSelectAll = () => {
        const allSelected = variables.every((v) => v.selected);
        setVariables((prev) => prev.map((v) => ({ ...v, selected: !allSelected })));
    };
    const handleDeselectAll = () => {
        setVariables((prev) => prev.map((v) => ({ ...v, selected: false })));
    };
    const handleUpdateVariable = (id, value) => {
        parent.postMessage({
            pluginMessage: {
                type: 'update-variable',
                id,
                value,
            },
        }, '*');
    };
    const handleScaleTypography = (factor) => {
        const selectedTypographyVars = selectedVariables.filter((v) => v.type === 'FLOAT');
        const ids = selectedTypographyVars.map((v) => v.id);
        parent.postMessage({
            pluginMessage: {
                type: 'scale-typography',
                variableIds: ids,
                factor,
            },
        }, '*');
    };
    const selectedVariables = variables.filter((v) => v.selected);
    const selectedCount = selectedVariables.length;
    const hasTypographySelected = selectedVariables.some((v) => v.type === 'FLOAT');
    if (loading) {
        return (_jsx("div", { className: "flex h-screen items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background p-6", children: [_jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Varpro" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Variables and Styles Manager" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "mb-3 text-lg font-semibold", children: "Variables" }), selectedCount > 0 && (_jsxs("div", { className: "mb-3 flex items-center gap-3 rounded-lg bg-muted p-3", children: [_jsxs("span", { className: "text-sm font-medium", children: [selectedCount, " selected"] }), _jsx(Button, { size: "sm", onClick: () => setScaleDialogOpen(true), disabled: !hasTypographySelected, children: "Scale Typography" }), _jsx(Button, { size: "sm", variant: "outline", onClick: handleDeselectAll, children: "Deselect All" })] })), _jsx(VariablesTable, { variables: variables, onToggleSelection: handleToggleSelection, onToggleSelectAll: handleToggleSelectAll, onUpdateVariable: handleUpdateVariable })] }), _jsxs("div", { children: [_jsx("h2", { className: "mb-3 text-lg font-semibold", children: "Styles" }), _jsx(StylesTable, { styles: styles })] })] })] }), _jsx(ScaleTypographyDialog, { open: scaleDialogOpen, onOpenChange: setScaleDialogOpen, selectedVariables: selectedVariables, onScale: handleScaleTypography })] }));
}
export default App;
