import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from './ui/table';
export function StylesTable({ styles }) {
    if (styles.length === 0) {
        return (_jsx("div", { className: "rounded-lg border bg-card p-8 text-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No styles found" }) }));
    }
    return (_jsx("div", { className: "rounded-lg border bg-card", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { children: "Value" })] }) }), _jsx(TableBody, { children: styles.map((style) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: style.name }), _jsx(TableCell, { children: _jsx("span", { className: "inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground", children: style.type }) }), _jsx(TableCell, { children: _jsx("span", { className: "text-sm", children: style.value }) })] }, style.id))) })] }) }));
}
