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

interface VariablesTableGroupedProps {
  variables: VariableData[];
  onToggleSelection: (id: string) => void;
  onUpdateVariable: (id: string, value: string) => void;
}

export function VariablesTableGrouped({
  variables,
  onToggleSelection,
  onUpdateVariable,
}: VariablesTableGroupedProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (variables.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No variables in this collection</p>
      </div>
    );
  }

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
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
  );
}
