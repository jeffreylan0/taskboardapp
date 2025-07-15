import { useState, useEffect, useCallback } from 'react';
import { Task } from '../pages/index';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Wand2 } from 'lucide-react';

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
  const [customDuration, setCustomDuration] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debounce hook
  useEffect(() => {
    if (title.trim().length < 5) {
      setRecommendation(null);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendation(data);
        } else {
          setRecommendation(null);
        }
      } catch (error) {
        console.error("Failed to fetch recommendation:", error);
        setRecommendation(null);
      } finally {
        setIsLoading(false);
      }
    }, 750); // 750ms debounce interval

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
        body: JSON.stringify({ title, duration }),
      });
      const newTask = await res.json();
      if (res.ok) {
        onTaskCreate(newTask);
      } else {
        throw new Error(newTask.message || 'failed to create task');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const adjustment = recommendation && recommendation.confidence > 0.75 ? 5 : 10;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>create a new task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="title">task title</Label>
            <Input
              id="title"
              placeholder="e.g., draft the quarterly report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-3">
            <Label>duration (minutes)</Label>
            {isLoading && <div className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />getting suggestion...</div>}

            {recommendation && !isLoading && (
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setDuration(recommendation.duration - adjustment); setIsCustom(false); }}
                >
                  {recommendation.duration - adjustment} min
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setDuration(recommendation.duration); setIsCustom(false); }}
                >
                  <Wand2 className="mr-2 h-4 w-4" /> {recommendation.duration} min
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setDuration(recommendation.duration + adjustment); setIsCustom(false); }}
                >
                  {recommendation.duration + adjustment} min
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button type="button" variant={isCustom ? "secondary" : "outline"} className="w-full" onClick={() => setIsCustom(true)}>custom</Button>

            {isCustom && (
              <Input
                type="number"
                placeholder="e.g., 25"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value);
                  setDuration(Number(e.target.value) || null);
                }}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>cancel</Button>
          <Button type="submit" disabled={!title || !duration || isCreating} className="bg-green-600 hover:bg-green-700 text-white">
            {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />creating...</> : 'create task'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddTaskForm;
