import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
export function ScaleTypographyDialog({ open, onOpenChange, selectedVariables, onScale, }) {
    const [factor, setFactor] = useState('1.0');
    const handleScale = () => {
        const numFactor = parseFloat(factor);
        if (numFactor > 0 && numFactor <= 10 && !isNaN(numFactor)) {
            onScale(numFactor);
            onOpenChange(false);
            setFactor('1.0');
        }
    };
    const typographyVars = selectedVariables.filter((v) => v.type === 'FLOAT');
    const factorNum = parseFloat(factor);
    const isValidFactor = !isNaN(factorNum) && factorNum > 0 && factorNum <= 10;
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, title: "Scale Typography", description: `Scale ${typographyVars.length} typography variable${typographyVars.length !== 1 ? 's' : ''} by a factor.`, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium leading-none", children: "Scale Factor" }), _jsx(Input, { type: "number", step: "0.1", min: "0.1", max: "10", value: factor, onChange: (e) => setFactor(e.target.value), placeholder: "e.g., 1.2 for 20% larger" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Examples: 1.2 = 20% larger, 0.8 = 20% smaller" })] }), isValidFactor && typographyVars.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-medium", children: "Preview:" }), typographyVars.slice(0, 3).map((v) => {
                            const currentValue = parseFloat(v.value);
                            const newValue = currentValue * factorNum;
                            return (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsxs("span", { className: "text-muted-foreground", children: [v.name, ": ", v.value] }), _jsxs("span", { className: "font-medium text-primary", children: ["\u2192 ", newValue.toFixed(2)] })] }, v.id));
                        }), typographyVars.length > 3 && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["+ ", typographyVars.length - 3, " more"] }))] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                onOpenChange(false);
                                setFactor('1.0');
                            }, children: "Cancel" }), _jsx(Button, { onClick: handleScale, disabled: !isValidFactor, children: "Apply Scale" })] })] }) }));
}
