import { useState, useEffect } from 'react';
import { Task } from '../pages/index';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { PropertyManager } from './PropertyManager';
import type { LocalProperty } from '@/types/properties';

interface AddTaskFormProps {
  onTaskCreate: (newTask: Task) => void;
  onClose: () => void;
}

interface Recommendation {
  duration: number;
  confidence: number;
}

const AddTaskForm = ({ onTaskCreate, onClose }: AddTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [properties, setProperties] = useState<LocalProperty[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchDefaults = async () => {
        try {
            const res = await fetch(`/api/settings/default-properties?t=${new Date().getTime()}`);
            if (res.ok) {
                const defaultProps = await res.json();
                const initialProps = defaultProps.map((p: any) => ({
                    ...p,
                    id: crypto.randomUUID(),
                    value: p.type === 'MULTI_SELECT' ? [] : (p.type === 'CHECKBOX' ? false : null),
                }));
                setProperties(initialProps);
            }
        } catch (error) {
            console.error("Failed to fetch default properties:", error);
        }
    };
    fetchDefaults();
  }, []);

  useEffect(() => {
    if (title.trim().length < 5) {
      setRecommendation(null);
      return;
    }
    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendation(data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendation:", error);
      } finally {
        setIsLoading(false);
      }
    }, 750);
    return () => clearTimeout(handler);
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !duration) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, duration, properties }),
      });
      const newTask = await res.json();
      if (!res.ok) throw new Error(newTask.message || 'failed to create task');
      onTaskCreate(newTask);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const adjustment = recommendation && recommendation.confidence > 0.75 ? 5 : 10;

  return (
    <DialogContent className="sm:max-w-2xl dark:bg-slate-950">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create a New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto pr-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>

          <hr className="my-2 dark:border-slate-800" />

          {/* FIX: Restructured layout */}
          <div className="space-y-4">
            <Label className="text-base font-medium">properties</Label>

            {/* Duration Input */}
            <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                    <Label className="font-medium pl-10">duration</Label>
                </div>
                <div className="col-span-7 space-y-2">
                    {isLoading && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Getting suggestion...</div>}
                    {recommendation && !isLoading && (
                        <div className="grid grid-cols-3 gap-2">
                            <Button type="button" variant="outline" onClick={() => setDuration(recommendation.duration - adjustment)}>{`${recommendation.duration - adjustment} min`}</Button>
                            <Button type="button" variant="outline" onClick={() => setDuration(recommendation.duration)}>
                                <Wand2 className="mr-2 h-4 w-4"/> {recommendation.duration} min
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setDuration(recommendation.duration + adjustment)}>{`${recommendation.duration + adjustment} min`}</Button>
                        </div>
                    )}
                    <Input
                        type="number"
                        placeholder="Custom duration (min)..."
                        onChange={(e) => setDuration(Number(e.target.value) || null)}
                    />
                </div>
            </div>

            {/* Custom Properties Manager */}
            <PropertyManager
                properties={properties}
                onPropertiesChange={setProperties}
                showLabel={false} // Hide the internal label
            />
          </div>

        </div>
        <DialogFooter className='pt-4 border-t dark:border-slate-800'>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!title || !duration || isCreating} className="bg-green-600 hover:bg-green-700 text-white">
            {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</> : 'Create Task'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddTaskForm;
