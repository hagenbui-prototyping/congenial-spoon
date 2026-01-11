import { ColorScaleAlgorithm } from '../types';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AlgorithmSelectorProps {
  value: ColorScaleAlgorithm;
  onChange: (value: ColorScaleAlgorithm) => void;
}

const algorithms: { value: ColorScaleAlgorithm; label: string; description: string }[] = [
  {
    value: 'tint-shade',
    label: 'Tint & Shade',
    description: 'Mix with white for lighter shades, black for darker. Simple and predictable.',
  },
  {
    value: 'hsl-lightness',
    label: 'HSL Lightness',
    description: 'Adjust lightness only, preserving saturation. Vibrant colors throughout.',
  },
  {
    value: 'hsl-saturation',
    label: 'HSL Saturation + Lightness',
    description: 'Adjust both saturation and lightness. More natural-looking scales.',
  },
  {
    value: 'perceptual-lightness',
    label: 'Perceptual Lightness',
    description: 'Gamma-corrected for uniform perceived brightness. Best for accessibility.',
  },
];

export function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Algorithm</Label>
      <RadioGroup value={value} onValueChange={(val) => onChange(val as ColorScaleAlgorithm)}>
        {algorithms.map((algo) => (
          <div key={algo.value} className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value={algo.value} id={algo.value} className="mt-1" />
            <div className="flex-1">
              <Label htmlFor={algo.value} className="font-medium cursor-pointer">
                {algo.label}
              </Label>
              <p className="text-sm text-muted-foreground">{algo.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
