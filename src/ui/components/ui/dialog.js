import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export function Dialog({ open, onOpenChange, title, description, children }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onOpenChange]);
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity", onClick: () => onOpenChange(false) }), _jsxs("div", { className: "relative z-50 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg animate-in fade-in-0 zoom-in-95", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h2", { className: "text-lg font-semibold leading-none tracking-tight", children: title }), description && (_jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: description }))] }), _jsx("div", { children: children })] })] }));
}
Dialog.displayName = 'Dialog';
