import { VariableCollectionData } from '../types';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CollectionSelectorProps {
  collections: VariableCollectionData[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function CollectionSelector({
  collections,
  value,
  onChange,
}: CollectionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Target Collection</Label>
      <Select
        value={value || 'new'}
        onValueChange={(val) => onChange(val === 'new' ? undefined : val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a collection" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">
            <span className="font-medium">Create New Collection</span>
          </SelectItem>
          {collections.length > 0 && (
            <>
              <div className="h-px bg-border my-1" />
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {value
          ? 'Variables will be added to the selected collection'
          : 'A new collection will be created for this scale'}
      </p>
    </div>
  );
}
