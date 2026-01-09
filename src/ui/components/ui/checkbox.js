import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useEffect } from 'react';
export const Checkbox = React.forwardRef(({ checked, onCheckedChange, disabled = false, indeterminate = false, className = '' }, ref) => {
    const internalRef = useRef(null);
    const checkboxRef = ref || internalRef;
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate, checkboxRef]);
    return (_jsxs("div", { className: "relative flex items-center", children: [_jsx("input", { ref: checkboxRef, type: "checkbox", checked: checked, onChange: (e) => onCheckedChange(e.target.checked), disabled: disabled, className: `peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className}`, "data-state": checked ? 'checked' : 'unchecked' }), checked && !indeterminate && (_jsx("svg", { className: "pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-primary-foreground", viewBox: "0 0 12 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M10 3L4.5 8.5L2 6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })), indeterminate && (_jsx("svg", { className: "pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-primary-foreground", viewBox: "0 0 12 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M2.5 6H9.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }) }))] }));
});
Checkbox.displayName = 'Checkbox';
