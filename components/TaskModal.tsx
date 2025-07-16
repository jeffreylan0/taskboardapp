import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Task } from '../pages/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (completedTask: Task) => void;
  onUpdate: (updatedTask: Task) => void;
}

const TaskModal = ({ task, onClose, onComplete, onUpdate }: TaskModalProps) => {
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState(task.title);
  const [duration, setDuration] = useState(task.duration);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, title, duration }),
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
      
      await updateSession(); // Refresh session to get new streak
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>edit task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">duration</dd>
            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="col-span-3" />
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
