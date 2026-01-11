import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { ColorScaleValidation } from '../utils/variableParser';

interface ReformatGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  validation: ColorScaleValidation;
  variableCount: number;
  onConfirm: (steps: number[]) => void;
}

export function ReformatGroupDialog({
  open,
  onOpenChange,
  groupName,
  validation,
  variableCount,
  onConfirm,
}: ReformatGroupDialogProps) {
  const [customSteps, setCustomSteps] = useState<string>(
    validation.suggestedSteps ? validation.suggestedSteps.join(', ') : '50, 100, 200, 300, 400, 500, 600, 700, 800, 900'
  );

  const handleConfirm = () => {
    const steps = customSteps
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    onConfirm(steps);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reformat Group for Color Scale</DialogTitle>
          <DialogDescription>
            Group "{groupName}" does not follow the standard color scale format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Issues */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <h4 className="font-semibold text-sm text-yellow-900 mb-2">Format Issues:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              {validation.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>

          {/* Expected Format */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Expected Format:</h4>
            <p className="text-sm text-muted-foreground">{validation.expectedFormat}</p>
          </div>

          {/* Current Variables Count */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Current Variables:</h4>
            <p className="text-sm text-muted-foreground">
              {variableCount} variable(s) in this group
            </p>
          </div>

          {/* Suggested Steps */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Color Scale Steps:</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSteps}
                onChange={(e) => setCustomSteps(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="50, 100, 200, 300, 400, 500, 600, 700, 800, 900"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter comma-separated numbers (e.g., 50, 100, 200, ..., 900)
            </p>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-900">
              <strong>Warning:</strong> This will regenerate all variables in this group
              with the new format. Existing variables will be updated or recreated.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Reformat and Generate Scale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
