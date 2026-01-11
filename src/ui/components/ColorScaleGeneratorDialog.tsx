import { useEffect, useState } from 'react';
import {
  ColorScaleAlgorithm,
  ColorScaleConfig,
  ColorScalePreview,
  VariableCollectionData,
} from '../types';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ColorScalePreview as ColorScalePreviewComponent } from './ColorScalePreview';
import { CollectionSelector } from './CollectionSelector';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ColorScaleGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: VariableCollectionData[];
  initialCollectionId?: string;
  onGenerate: (config: ColorScaleConfig) => void;
  onPreview: (config: ColorScaleConfig) => void;
  previews: ColorScalePreview[];
}

const DEFAULT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export function ColorScaleGeneratorDialog({
  open,
  onOpenChange,
  collections,
  initialCollectionId,
  onGenerate,
  onPreview,
  previews,
}: ColorScaleGeneratorDialogProps) {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [algorithm, setAlgorithm] = useState<ColorScaleAlgorithm>('tint-shade');
  const [baseName, setBaseName] = useState('primary');
  const [targetCollectionId, setTargetCollectionId] = useState<string | undefined>(
    initialCollectionId
  );

  // Debounced preview update
  useEffect(() => {
    if (!open) return;

    // Validate hex color
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(baseColor)) return;

    const timer = setTimeout(() => {
      const config: ColorScaleConfig = {
        baseColor,
        algorithm,
        steps: DEFAULT_STEPS,
        baseName,
        targetCollectionId,
      };
      onPreview(config);
    }, 300);

    return () => clearTimeout(timer);
  }, [baseColor, algorithm, baseName, targetCollectionId, open, onPreview]);

  const handleGenerate = () => {
    const config: ColorScaleConfig = {
      baseColor,
      algorithm,
      steps: DEFAULT_STEPS,
      baseName,
      targetCollectionId,
    };
    onGenerate(config);
    onOpenChange(false);
  };

  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(baseColor);
  const isValidName = baseName.trim().length > 0;
  const canGenerate = isValidHex && isValidName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Color Scale</DialogTitle>
          <DialogDescription>
            Create a Tailwind-style color scale (50-900) from a base color
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Base Color Input */}
          <div className="space-y-2">
            <Label htmlFor="baseColor">Base Color</Label>
            <div className="flex gap-2">
              <Input
                id="baseColor"
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 font-mono"
              />
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="h-10 w-14 rounded border cursor-pointer"
              />
            </div>
            {!isValidHex && baseColor.length > 0 && (
              <p className="text-xs text-destructive">
                Invalid hex color. Use format: #RRGGBB
              </p>
            )}
          </div>

          {/* Base Name Input */}
          <div className="space-y-2">
            <Label htmlFor="baseName">Base Name</Label>
            <Input
              id="baseName"
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="primary"
            />
            <p className="text-xs text-muted-foreground">
              Variables will be named: {baseName}/{'{'}step{'}'} (e.g., {baseName}/500)
            </p>
          </div>

          {/* Collection Selector */}
          <CollectionSelector
            collections={collections}
            value={targetCollectionId}
            onChange={setTargetCollectionId}
          />

          {/* Algorithm Selector */}
          <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />

          {/* Preview */}
          <ColorScalePreviewComponent previews={previews} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!canGenerate}>
            Generate Scale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
