import { useState, useEffect } from 'react';
import { Task } from '../pages/index';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { PropertyManager, LocalProperty } from './PropertyManager'; // Import the new component and type

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
  const [properties, setProperties] = useState<LocalProperty[]>([]); // State for custom properties

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debounce effect to get AI-estimated duration
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
        body: JSON.stringify({ title, duration, properties }), // Send properties to the API
      });
      const newTask = await res.json();
      if (!res.ok) throw new Error(newTask.message || 'failed to create task');
      onTaskCreate(newTask);
      onClose(); // Close modal on success
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
          <DialogTitle>create a new task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto pr-6">
          <div className="space-y-2">
            <Label htmlFor="title">task title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-3">
            <Label>duration (minutes)</Label>
            {isLoading && <div className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />getting suggestion...</div>}

            {recommendation && !isLoading && (
                 <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant="outline" onClick={() => setDuration(recommendation.duration - adjustment)}>{`${recommendation.duration - adjustment} min`}</Button>
                    <Button type="button" variant="outline" onClick={() => setDuration(recommendation.duration)}>
                        <Wand2 className="mr-2 h-4 w-4"/> {recommendation.duration} min
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setDuration(recommendation.duration + adjustment)}>{`${recommendation.duration + adjustment} min`}</Button>
                 </div>
             )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
            </div>

            <Input
                type="number"
                placeholder="enter a custom duration..."
                onChange={(e) => setDuration(Number(e.target.value) || null)}
            />
          </div>

          <hr className="my-2 dark:border-slate-800" />

          {/* Use the new PropertyManager component */}
          <PropertyManager properties={properties} onPropertiesChange={setProperties} />

        </div>
        <DialogFooter className='pt-4 border-t dark:border-slate-800'>
          <Button type="button" variant="ghost" onClick={onClose}>cancel</Button>
          <Button type="submit" disabled={!title || !duration || isCreating} className="bg-green-600 hover:bg-green-700 text-white">
            {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>creating...</> : 'create task'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddTaskForm;
