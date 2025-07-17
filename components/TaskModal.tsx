import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Task } from '../pages/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PropertyType } from '@prisma/client';
import { PlusCircle, Trash2 } from 'lucide-react';

// Define a type for our local property state
type LocalProperty = {
  id: string;
  name: string;
  type: PropertyType;
  value: any;
};

interface TaskModalProps {
  task: Task & { properties?: LocalProperty[] }; // Allow properties on the task prop
  onClose: () => void;
  onComplete: (completedTask: Task) => void;
  onUpdate: (updatedTask: Task) => void;
}

// --- Dynamic Property Input Component ---
const PropertyInput = ({ property, onChange, onRemove }: { property: LocalProperty, onChange: (field: keyof LocalProperty, value: any) => void, onRemove: () => void }) => {
    // This component will render the correct input based on the property's type
    const renderValueInput = () => {
        switch (property.type) {
            case 'NUMBER':
                return <Input type="number" value={property.value || ''} onChange={(e) => onChange('value', e.target.value)} />;
            case 'CHECKBOX':
                return <Input type="checkbox" checked={!!property.value} onChange={(e) => onChange('value', e.target.checked)} className="h-5 w-5" />;
            case 'DATE':
                 return <Input type="date" value={property.value || ''} onChange={(e) => onChange('value', e.target.value)} />;
            case 'URL':
                 return <Input type="url" placeholder="https://..." value={property.value || ''} onChange={(e) => onChange('value', e.target.value)} />;
            case 'EMAIL':
                 return <Input type="email" placeholder="name@example.com" value={property.value || ''} onChange={(e) => onChange('value', e.target.value)} />;
            case 'PHONE':
                 return <Input type="tel" placeholder="123-456-7890" value={property.value || ''} onChange={(e) => onChange('value', e.target.value)} />;
            case 'TEXT':
            default:
                return <Input type="text" value={property.value || ''} onChange={(e) => onChange('value', e.target.value)} />;
        }
    };

    return (
        <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-4">
                <Input placeholder="property name" value={property.name} onChange={(e) => onChange('name', e.target.value)} />
            </div>
            <div className="col-span-3">
                <Select value={property.type} onValueChange={(v) => onChange('type', v as PropertyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.values(PropertyType).map(pt => <SelectItem key={pt} value={pt}>{pt.toLowerCase()}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="col-span-4">{renderValueInput()}</div>
            <div className="col-span-1">
                <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
        </div>
    );
};


// --- Main Task Modal Component ---
const TaskModal = ({ task, onClose, onComplete, onUpdate }: TaskModalProps) => {
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState(task.title);
  const [duration, setDuration] = useState(task.duration);
  const [properties, setProperties] = useState<LocalProperty[]>(task.properties || []);

  const handleAddProperty = () => {
    setProperties(prev => [...prev, { id: crypto.randomUUID(), name: '', type: 'TEXT', value: '' }]);
  };

  const handlePropertyChange = (index: number, field: keyof LocalProperty, value: any) => {
    setProperties(prev => {
        const newProps = [...prev];
        newProps[index] = { ...newProps[index], [field]: value };
        return newProps;
    });
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, title, duration, properties }),
      });
      const updatedTask = await res.json();
      if (!res.ok) throw new Error(updatedTask.message || 'Failed to save changes');
      
      onUpdate(updatedTask);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    // ... (handleComplete logic remains the same)
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl"> {/* Enlarged modal */}
        <DialogHeader>
          <DialogTitle>edit task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Main task details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="title">title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="duration">duration (min)</Label>
                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>
          
          <hr className="my-4" />

          {/* Custom Properties Section */}
          <div className="space-y-4">
            <Label>custom properties</Label>
            {properties.map((prop, index) => (
                <PropertyInput 
                    key={prop.id}
                    property={prop}
                    onChange={(field, value) => handlePropertyChange(index, field, value)}
                    onRemove={() => handleRemoveProperty(index)}
                />
            ))}
            <Button variant="outline" size="sm" onClick={handleAddProperty}>
                <PlusCircle className="mr-2 h-4 w-4" /> add property
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button 
            onClick={handleComplete} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? '...' : 'complete task'}
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isLoading}
          >
            {isLoading ? '...' : 'save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
