import { useState } from 'react';
import { Task } from '../pages/index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'; // Assumes shadcn/ui setup
import { Button } from './ui/button'; // Assumes shadcn/ui setup
import { Input } from './ui/input'; // Assumes shadcn/ui setup
import { Label } from './ui/label'; // Assumes shadcn/ui setup

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

const TaskModal = ({ task, onClose, onComplete }: TaskModalProps) => {
  const [isCompleting, setIsCompleting] = useState(false);

  // States for editable fields
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

      onComplete(task.id);
      onClose();
    } catch (error) {
      console.error(error);
      // Optionally show an error message to the user
    } finally {
      setIsCompleting(false);
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
            <Label htmlFor="duration" className="text-right">duration</Label>
            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">tags</Label>
             <div className="col-span-3 text-sm text-gray-500">(coming soon)</div>
          </div>
        </div>
        <DialogFooter>
          {/* A save button could be added here to persist title/duration changes */}
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
