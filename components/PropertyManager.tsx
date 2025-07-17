import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, GripVertical, Plus, X, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Type Definitions ---
const propertyTypes = ["TEXT", "NUMBER", "CHECKBOX", "SELECT", "MULTI_SELECT", "DATE", "URL", "EMAIL", "PHONE"] as const;
type PropertyType = typeof propertyTypes[number];

type SelectOption = {
  id: string;
  name: string;
  color?: string;
};

export type LocalProperty = {
  id:string;
  name: string;
  type: PropertyType;
  value: any;
  options?: SelectOption[];
};

// --- Multi-Select Input Sub-Component ---
const MultiSelectInput = ({ options, value, onChange }: { options: SelectOption[], value: string[], onChange: (newValue: string[]) => void }) => {
    const [open, setOpen] = useState(false);
    // Use a Set for efficient lookups to check if an option is selected
    const selectedValues = new Set(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-auto min-h-[2.5rem]">
                    <div className="flex gap-1 flex-wrap">
                        {value.length > 0
                            ? value.map(val => <Badge key={val} variant="secondary" className="font-normal">{val}</Badge>)
                            : <span className="text-muted-foreground font-normal">select options...</span>
                        }
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="search options..." />
                    <CommandEmpty>no option found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => {
                                    const newSelectedValues = new Set(selectedValues);
                                    if (newSelectedValues.has(option.name)) {
                                        newSelectedValues.delete(option.name);
                                    } else {
                                        newSelectedValues.add(option.name);
                                    }
                                    onChange(Array.from(newSelectedValues));
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", selectedValues.has(option.name) ? "opacity-100" : "opacity-0")}/>
                                {option.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


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
    // When changing a property type, reset its value to avoid data mismatches
    if (existingProp && existingProp.type !== updatedProperty.type) {
        // If changing to multi-select, initialize value as an empty array
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
          return <Input type="email" placeholder="name@example.com" value={prop.value || ''} onChange={(e) => handleValueChange(prop.id, e.gant.value)} />;
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
