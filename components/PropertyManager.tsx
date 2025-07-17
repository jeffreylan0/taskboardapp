import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';

// --- Manual Type Definition ---
// This ensures the component works without relying on a potentially faulty Prisma Client import.
const propertyTypes = ["TEXT", "NUMBER", "CHECKBOX", "SELECT", "MULTI_SELECT", "DATE", "URL", "EMAIL", "PHONE"] as const;
type PropertyType = typeof propertyTypes[number];

// Exporting the LocalProperty type so it can be used in the modals.
export type LocalProperty = {
  id: string;
  name: string;
  type: PropertyType;
  value: any;
  options?: { id: string, name: string, color?: string }[]; // For select types
};

// --- Editor Popover Sub-Component ---
// This popover allows users to edit the definition of a property (its name and type).
const PropertyEditor = ({ property, onSave, onDelete }: { property: LocalProperty, onSave: (updatedProperty: LocalProperty) => void, onDelete: () => void }) => {
    const [localProp, setLocalProp] = useState(property);

    const handleSave = () => {
        onSave(localProp);
    };

    // Placeholder for future functionality where users can define options for SELECT types.
    const renderOptionEditor = () => {
        if (localProp.type === 'SELECT' || localProp.type === 'MULTI_SELECT') {
            return (
                <div className='mt-4'>
                    <Label>options (coming soon)</Label>
                    <div className='text-xs p-3 bg-muted rounded-md text-muted-foreground'>
                        You will be able to add select options here in a future update.
                    </div>
                </div>
            )
        }
        return null;
    }

    return (
        <PopoverContent className="w-80" align="start">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">edit property</h4>
                    <p className="text-sm text-muted-foreground">
                        customize your property.
                    </p>
                </div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="name">name</Label>
                        <Input id="name" value={localProp.name} onChange={(e) => setLocalProp(p => ({ ...p, name: e.target.value }))} className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="type">type</Label>
                        <Select value={localProp.type} onValueChange={(v) => setLocalProp(p => ({ ...p, type: v as PropertyType }))}>
                            <SelectTrigger className="col-span-2 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {propertyTypes.map(pt => <SelectItem key={pt} value={pt}>{pt.toLowerCase()}</SelectItem>)}
                            </SelectContent>
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
// This component manages the list of properties for a task.
interface PropertyManagerProps {
    properties: LocalProperty[];
    onPropertiesChange: (properties: LocalProperty[]) => void;
}

export const PropertyManager = ({ properties, onPropertiesChange }: PropertyManagerProps) => {

    const handleAddProperty = () => {
        const newProp: LocalProperty = { id: crypto.randomUUID(), name: 'new property', type: 'TEXT', value: '' };
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

    // Renders the correct input field for a property's value based on its type.
    const renderValueInput = (prop: LocalProperty) => {
        switch (prop.type) {
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
                    <div key={prop.id} className="grid grid-cols-12 gap-2 items-start">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="col-span-5 justify-start font-medium h-auto py-1 text-left">
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
