import { useState } from 'react';
import { VariableData } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface VariablesTableProps {
  variables: VariableData[];
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onUpdateVariable: (id: string, value: string) => void;
}

export function VariablesTable({
  variables,
  onToggleSelection,
  onToggleSelectAll,
  onUpdateVariable,
}: VariablesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (variables.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No variables found</p>
      </div>
    );
  }

  const selectedCount = variables.filter((v) => v.selected).length;
  const allSelected = selectedCount === variables.length;
  const someSelected = selectedCount > 0 && selectedCount < variables.length;

  const handleStartEdit = (variable: VariableData) => {
    setEditingId(variable.id);
    setEditValue(variable.value);
  };

  const handleSaveEdit = (variable: VariableData) => {
    onUpdateVariable(variable.id, editValue);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((variable) => (
            <TableRow
              key={variable.id}
              className={variable.selected ? 'bg-muted' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={variable.selected || false}
                  onCheckedChange={() => onToggleSelection(variable.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{variable.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {variable.type}
                </span>
              </TableCell>
              <TableCell>
                {editingId === variable.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type={variable.type === 'FLOAT' ? 'number' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32"
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(variable)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <div className="flex items-center gap-2">
                      {variable.type === 'COLOR' && (
                        <div
                          className="h-5 w-5 rounded border border-gray-300 shadow-sm"
                          style={{ backgroundColor: variable.value }}
                        />
                      )}
                      <span className="font-mono text-xs">{variable.value}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStartEdit(variable)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
