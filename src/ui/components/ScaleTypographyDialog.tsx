import { useState } from 'react';
import { VariableData } from '../types';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ScaleTypographyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVariables: VariableData[];
  onScale: (factor: number) => void;
}

export function ScaleTypographyDialog({
  open,
  onOpenChange,
  selectedVariables,
  onScale,
}: ScaleTypographyDialogProps) {
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

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Scale Typography"
      description={`Scale ${typographyVars.length} typography variable${
        typographyVars.length !== 1 ? 's' : ''
      } by a factor.`}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Scale Factor
          </label>
          <Input
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            placeholder="e.g., 1.2 for 20% larger"
          />
          <p className="text-xs text-muted-foreground">
            Examples: 1.2 = 20% larger, 0.8 = 20% smaller
          </p>
        </div>

        {isValidFactor && typographyVars.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Preview:</p>
            {typographyVars.slice(0, 3).map((v) => {
              const currentValue = parseFloat(v.value);
              const newValue = currentValue * factorNum;
              return (
                <div
                  key={v.id}
                  className="flex justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    {v.name}: {v.value}
                  </span>
                  <span className="font-medium text-primary">
                    → {newValue.toFixed(2)}
                  </span>
                </div>
              );
            })}
            {typographyVars.length > 3 && (
              <p className="text-xs text-muted-foreground">
                + {typographyVars.length - 3} more
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFactor('1.0');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleScale} disabled={!isValidFactor}>
            Apply Scale
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
