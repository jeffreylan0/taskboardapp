import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Task } from '../pages/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PropertyManager } from './PropertyManager';
import type { LocalProperty } from '@/types/properties';

interface TaskModalProps {
  task: Task & { properties?: LocalProperty[] | null };
  onClose: () => void;
  onComplete: (completedTask: Task) => void;
  onUpdate: (updatedTask: Task) => void;
}

const TaskModal = ({ task, onClose, onComplete, onUpdate }: TaskModalProps) => {
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [duration, setDuration] = useState(task.duration);
  const [properties, setProperties] = useState<LocalProperty[]>(Array.isArray(task.properties) ? task.properties : []);

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
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: true }),
      });
      const completedTask = await res.json();
      if (!res.ok) throw new Error(completedTask.message || 'Failed to complete task');

      await updateSession();
      onComplete(completedTask);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <hr className="my-2 dark:border-slate-800" />

          {/* FIX: Restructured layout to match AddTaskForm */}
          <div className="space-y-4">
            <Label className="text-base font-medium">properties</Label>

            <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                    <Label className="font-medium pl-10">duration</Label>
                </div>
                <div className="col-span-7">
                    <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
            </div>

            <PropertyManager
                properties={properties}
                onPropertiesChange={setProperties}
                showLabel={false}
            />
          </div>

        </div>
        <DialogFooter className="sm:justify-between pt-4 border-t dark:border-slate-800">
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? '...' : 'Complete Task'}
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
