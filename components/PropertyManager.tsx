import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, GripVertical, Plus, X } from 'lucide-react';
import { MultiSelectInput } from './MultiSelectInput';
import type { LocalProperty, PropertyType, SelectOption } from '@/types/properties';
import { propertyTypes } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';


// --- Property Editor Popover Sub-Component ---
const PropertyEditor = ({ property, onSave, onDelete }: { property: LocalProperty, onSave: (updatedProperty: LocalProperty) => void, onDelete: () => void }) => {
    const [localProp, setLocalProp] = useState<LocalProperty>(() => ({
        ...property,
        options: property.type === 'SELECT' || property.type === 'MULTI_SELECT' ? property.options ?? [] : undefined,
    }));
    const [newOptionName, setNewOptionName] = useState('');

    // This function is now called by the Popover's onOpenChange handler
    const handleAutoSave = () => {
        const cleanedOptions = localProp.options?.filter(opt => opt.name.trim() !== '');
        onSave({...localProp, options: cleanedOptions });
    };

    const handleTypeChange = (v: string) => {
        const newType = v as PropertyType;
        // When the type changes, also update the name to match the new type
        const newName = newType.toLowerCase().replace('_', ' ');
        if (newType === 'SELECT' || newType === 'MULTI_SELECT') {
            setLocalProp(p => ({ ...p, name: newName, type: newType, options: p.options ?? [] }));
        } else {
            setLocalProp(p => ({ ...p, name: newName, type: newType, options: undefined, value: null }));
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

    const cleanPropertyTypes = propertyTypes.filter(pt => typeof pt ==='string' && pt.trim() !== '');

    return (
        // The onOpenChange handler triggers the save when the popover closes
        <PopoverContent className="w-80" align="start" onInteractOutside={handleAutoSave}>
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Edit Property</h4>
                    <p className="text-sm text-muted-foreground">Customize your property.</p>
                </div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={localProp.name} onChange={(e) => setLocalProp(p => ({ ...p, name: e.target.value }))} className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="type">Type</Label>
                        <Select value={localProp.type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="col-span-2 h-8">
                                <SelectValue placeholder="Select a type..." />
                            </SelectTrigger>
                            <SelectContent>{cleanPropertyTypes.map(pt => <SelectItem key={pt} value={pt}>{pt.toLowerCase().replace('_', ' ')}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    {renderOptionEditor()}
                </div>
                <div className='flex justify-end items-center pt-4'>
                    <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
                </div>
            </div>
        </PopoverContent>
    );
}

// --- Main Property Manager Component ---
interface PropertyManagerProps {
  properties: LocalProperty[];
  onPropertiesChange: (properties: LocalProperty[]) => void;
  showLabel?: boolean;
}

export const PropertyManager = ({ properties, onPropertiesChange, showLabel = true }: PropertyManagerProps) => {
  const handleAddProperty = () => {
    // FIX: Default name is now "Text"
    const newProp: LocalProperty = { id: crypto.randomUUID(), name: 'text', type: 'TEXT', value: null };
    onPropertiesChange([...properties, newProp]);
  };

  const handleUpdateProperty = (updatedProperty: LocalProperty) => {
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
      case 'SELECT': {
        const PROMPT_VALUE = "__prompt__";
        return (
          <Select
            value={prop.value ?? undefined}
            onValueChange={(value) => {
              if (value !== PROMPT_VALUE) {
                handleValueChange(prop.id, value);
              }
            }}
          >
            <SelectTrigger className="w-full text-left">
                <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROMPT_VALUE} disabled>
                <em className="text-muted-foreground">Select an option…</em>
              </SelectItem>
              <SelectSeparator />
              {(prop.options && prop.options.length > 0) && (
                  prop.options
                    .filter(opt => opt && opt.name && opt.name.trim() !== '')
                    .map(opt => <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>)
              )}
            </SelectContent>
          </Select>
        );
      }
      case 'MULTI_SELECT': {
        const cleanOptions = (prop.options || []).filter(opt => opt && opt.name && opt.name.trim() !== '');
        return (
            <MultiSelectInput
                options={cleanOptions}
                value={Array.isArray(prop.value) ? prop.value : []}
                onChange={(newValue) => handleValueChange(prop.id, newValue)}
            />
        );
      }
      case 'NUMBER':
        return <Input type="number" placeholder="value" value={prop.value ?? ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'CHECKBOX':
        return <div className='flex items-center h-full'><Input type="checkbox" checked={!!prop.value} onChange={(e) => handleValueChange(prop.id, e.target.checked)} className="h-5 w-5" /></div>;
      case 'DATE':
          return <Input type="date" value={prop.value ?? ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'URL':
          return <Input type="url" placeholder="https://..." value={prop.value ?? ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'EMAIL':
          return <Input type="email" placeholder="name@example.com" value={prop.value ?? ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'PHONE':
          return <Input type="tel" placeholder="123-456-7890" value={prop.value ?? ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} />;
      case 'TEXT':
      default:
        return <Textarea placeholder="value..." value={prop.value ?? ''} onChange={(e) => handleValueChange(prop.id, e.target.value)} rows={1} className="text-sm" />;
    }
  }

  return (
    <div className="space-y-4">
      {showLabel && <Label>properties</Label>}
      <div className='space-y-2'>
        {properties.map((prop) => (
          <div key={prop.id} className="grid grid-cols-12 gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="col-span-5 justify-start font-medium h-full text-left capitalize">
                  <GripVertical className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{prop.name || '(no name)'}</span>
                </Button>
              </PopoverTrigger>
              <PropertyEditor
                property={prop}
                onSave={handleUpdateProperty}
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
