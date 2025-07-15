import { useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
import { Task } from '../pages/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

const TaskModal = ({ task, onClose, onComplete }: TaskModalProps) => {
  const { update } = useSession(); // Get the session update function
  const [isCompleting, setIsCompleting] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [duration, setDuration] = useState(task.duration);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: true }),
      });

      if (!res.ok) {
        throw new Error('failed to complete task');
      }

      await update(); // This tells NextAuth to refetch the session
      
      onComplete(task.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  // ... rest of the component
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
            <Label htmlFor="duration" className="text-right">duration</Label>
            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">tags</Label>
             <div className="col-span-3 text-sm text-gray-500">(coming soon)</div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleComplete} 
            disabled={isCompleting}
            className="bg-green-600 hover:bg-green-700 text-white w-full"
          >
            {isCompleting ? 'completing...' : 'complete task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
