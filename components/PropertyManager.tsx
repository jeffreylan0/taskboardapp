// components/PropertyManager.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, GripVertical, Plus, X } from 'lucide-react';
import { MultiSelectInput } from './MultiSelectInput'; // Import the new component
import type { LocalProperty, PropertyType, SelectOption } from '@/types/properties'; // Import shared types
import { propertyTypes } from './types/properties'; // Import shared types

// --- Property Editor Popover Sub-Component ---
const PropertyEditor = ({ property, onSave, onDelete }: { property: LocalProperty, onSave: (updatedProperty: LocalProperty) => void, onDelete: () => void }) => {
    const [localProp, setLocalProp] = useState<LocalProperty>(() => ({
        ...property,
        options: property.type === 'SELECT' || property.type === 'MULTI_SELECT' ? property.options ?? [] : undefined,
    }));
    const [newOptionName, setNewOptionName] = useState('');

    const handleSave = () => {
        const cleanedOptions = localProp.options?.filter(opt => opt.name.trim() !== '');
        onSave({...localProp, options: cleanedOptions });
    };

    const handleTypeChange = (v: string) => {
        const newType = v as PropertyType;
        if (newType === 'SELECT' || newType === 'MULTI_SELECT') {
            setLocalProp(p => ({ ...p, type: newType, options: p.options ?? [] }));
        } else {
            setLocalProp(p => ({ ...p, type: newType, options: undefined }));
        }
    };

    const handleAddOption = () => {
        if (newOptionName.trim() === '') return;
        const newOption: SelectOption = { id: crypto.randomUUID(), name: newOptionName.trim() };
        setLocalProp(p => ({ ...p, options: [...(p.options || []), newOption] }));
        setNewOptionName('');
    };

    const handleUpdateOption = (id: string, newName: string) => {
        setLocalProp(p => ({
            ...p,
            options: p.options?.map(opt => opt.id === id ? { ...opt, name: newName } : opt)
        }));
    };

    const handleDeleteOption = (id: string) => {
        setLocalProp(p => ({
            ...p,
            options: p.options?.filter(opt => opt.id !== id)
        }));
    };

    const renderOptionEditor = () => {
        if (localProp.type !== 'SELECT' && localProp.type !== 'MULTI_SELECT') return null;
        return (
          <div className='mt-4 space-y-2'>
            <Label>options</Label>
            <div className='space-y-2 max-h-40 overflow-y-auto pr-2'>
              {localProp.options?.map(opt => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input value={opt.name} onChange={(e) => handleUpdateOption(opt.id, e.target.value)} className="h-8" placeholder="option name"/>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleDeleteOption(opt.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Input placeholder="add new option..." value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())} className="h-8"/>
              <Button type="button" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleAddOption}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
    };

    return (
        <PopoverContent className="w-80" align="start">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">edit property</h4>
                    <p className="text-sm text-muted-foreground">customize your property.</p>
                </div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="name">name</Label>
                        <Input id="name" value={localProp.name} onChange={(e) => setLocalProp(p => ({ ...p, name: e.target.value }))} className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="type">type</Label>
                        <Select value={localProp.type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="col-span-2 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{propertyTypes.map(pt => <SelectItem key={pt} value={pt}>{pt.toLowerCase().replace('_', ' ')}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    {renderOptionEditor()}
                </div>
                <div className='flex justify-between items-center pt-4'>
                    <Button variant="destructive" size="sm" onClick={onDelete}>delete</Button>
                    <Button size="sm" onClick={handleSave}>save</Button>
                </div>
            </div>
        </PopoverContent>
    );
}

// --- Main Property Manager Component ---
interface PropertyManagerProps {
  properties: LocalProperty[];
  onPropertiesChange: (properties: LocalProperty[]) => void;
}

export const PropertyManager = ({ properties, onPropertiesChange }: PropertyManagerProps) => {
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  const handleAddProperty = () => {
    const newProp: LocalProperty = { id: crypto.randomUUID(), name: 'new property', type: 'TEXT', value: '' };
    onPropertiesChange([...properties, newProp]);
  };

  const handleUpdateProperty = (updatedProperty: LocalProperty) => {
    const existingProp = properties.find(p => p.id === updatedProperty.id);
    if (existingProp && existingProp.type !== updatedProperty.type) {
        if (updatedProperty.type === 'MULTI_SELECT') {
            updatedProperty.value = [];
        } else {
            updatedProperty.value = '';
        }
    }
    onPropertiesChange(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const handleRemoveProperty = (id: string) => {
    onPropertiesChange(properties.filter(p => p.id !== id));
  };

  const handleValueChange = (id: string, value: any) => {
    onPropertiesChange(properties.map(p => p.id === id ? { ...p, value } : p));
  }

  const renderValueInput = (prop: LocalProperty) => {
    switch (prop.type) {
      case 'SELECT':
        return (
          <Select value={prop.value || ''} onValueChange={(value) => handleValueChange(prop.id, value)}>
            <SelectTrigger className="w-full text-left">
                <SelectValue placeholder="select an option..." />
            </SelectTrigger>
            <SelectContent>
              {(prop.options && prop.options.length > 0) ? (
                prop.options.map(opt => <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>)
              ) : (
                <div className="text-xs text-muted-foreground p-2 text-center">no options defined.</div>
              )}
            </SelectContent>
          </Select>
        );
      case 'MULTI_SELECT':
        return (
            <MultiSelectInput
                options={prop.options || []}
                value={Array.isArray(prop.value) ? prop.value : []}
                onChange={(newValue) => handleValueChange(prop.id, newValue)}
            />
        );
      case 'NUMBER':
        return <Input type="number" placeholder="value" value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'CHECKBOX':
        return <div className='flex items-center h-full'><Input type="checkbox" checked={!!prop.value} onChange={(e) => handleValueChange(prop.id, e.target.checked)} className="h-5 w-5" /></div>;
      case 'DATE':
          return <Input type="date" value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'URL':
          return <Input type="url" placeholder="https://..." value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'EMAIL':
          return <Input type="email" placeholder="name@example.com" value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'PHONE':
          return <Input type="tel" placeholder="123-456-7890" value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'TEXT':
      default:
        return <Textarea placeholder="value..." value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} rows={1} className="text-sm" />;
    }
  }

  return (
    <div className="space-y-4">
      <Label>custom properties</Label>
      <div className='space-y-2'>
        {properties.map((prop) => (
          <div key={prop.id} className="grid grid-cols-12 gap-2 items-center">
            <Popover open={editingPropertyId === prop.id} onOpenChange={(isOpen) => setEditingPropertyId(isOpen ? prop.id : null)}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="col-span-5 justify-start font-medium h-full text-left">
                  <GripVertical className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{prop.name || '(no name)'}</span>
                </Button>
              </PopoverTrigger>
              <PropertyEditor
                property={prop}
                onSave={(updatedProperty) => {
                  handleUpdateProperty(updatedProperty);
                  setEditingPropertyId(null);
                }}
                onDelete={() => handleRemoveProperty(prop.id)}
              />
            </Popover>

            <div className="col-span-7">
              {renderValueInput(prop)}
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={handleAddProperty}>
        <PlusCircle className="mr-2 h-4 w-4" /> add property
      </Button>
    </div>
  )
}
