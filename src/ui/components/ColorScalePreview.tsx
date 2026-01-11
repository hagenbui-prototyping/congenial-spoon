import { ColorScalePreview as ColorScalePreviewType } from '../types';
import { Label } from './ui/label';

interface ColorScalePreviewProps {
  previews: ColorScalePreviewType[];
}

export function ColorScalePreview({ previews }: ColorScalePreviewProps) {
  if (previews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Enter a base color to see preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Preview</Label>
      <div className="space-y-2">
        {previews.map((preview) => (
          <div
            key={preview.step}
            className="flex items-center gap-3 rounded-md border bg-card p-2 hover:bg-muted/50 transition-colors"
          >
            {/* Color swatch */}
            <div
              className="h-10 w-10 rounded border border-gray-300 shadow-sm flex-shrink-0"
              style={{ backgroundColor: preview.color }}
            />

            {/* Step number */}
            <div className="flex-shrink-0 w-12">
              <span className="text-sm font-semibold">{preview.step}</span>
            </div>

            {/* Variable name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{preview.variableName}</p>
            </div>

            {/* Hex value */}
            <div className="flex-shrink-0">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {preview.color}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
