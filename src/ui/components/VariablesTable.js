import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
export function VariablesTable({ variables, onToggleSelection, onToggleSelectAll, onUpdateVariable, }) {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    if (variables.length === 0) {
        return (_jsx("div", { className: "rounded-lg border bg-card p-8 text-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No variables found" }) }));
    }
    const selectedCount = variables.filter((v) => v.selected).length;
    const allSelected = selectedCount === variables.length;
    const someSelected = selectedCount > 0 && selectedCount < variables.length;
    const handleStartEdit = (variable) => {
        setEditingId(variable.id);
        setEditValue(variable.value);
    };
    const handleSaveEdit = (variable) => {
        onUpdateVariable(variable.id, editValue);
        setEditingId(null);
    };
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };
    return (_jsx("div", { className: "rounded-lg border bg-card", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-12", children: _jsx(Checkbox, { checked: allSelected, indeterminate: someSelected, onCheckedChange: onToggleSelectAll }) }), _jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { children: "Value" })] }) }), _jsx(TableBody, { children: variables.map((variable) => (_jsxs(TableRow, { className: variable.selected ? 'bg-muted' : '', children: [_jsx(TableCell, { children: _jsx(Checkbox, { checked: variable.selected || false, onCheckedChange: () => onToggleSelection(variable.id) }) }), _jsx(TableCell, { className: "font-medium", children: variable.name }), _jsx(TableCell, { children: _jsx("span", { className: "inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground", children: variable.type }) }), _jsx(TableCell, { children: editingId === variable.id ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { type: variable.type === 'FLOAT' ? 'number' : 'text', value: editValue, onChange: (e) => setEditValue(e.target.value), className: "w-32" }), _jsx(Button, { size: "sm", onClick: () => handleSaveEdit(variable), children: "Save" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: handleCancelEdit, children: "Cancel" })] })) : (_jsxs("div", { className: "flex items-center gap-2 group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [variable.type === 'COLOR' && (_jsx("div", { className: "h-5 w-5 rounded border border-gray-300 shadow-sm", style: { backgroundColor: variable.value } })), _jsx("span", { className: "font-mono text-xs", children: variable.value })] }), _jsx(Button, { size: "sm", variant: "ghost", className: "opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => handleStartEdit(variable), children: "Edit" })] })) })] }, variable.id))) })] }) }));
}
