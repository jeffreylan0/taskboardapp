import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task } from '../pages/index';
import { Dialog, DialogTrigger } from './ui/dialog'; // Assumes shadcn/ui setup
import AddTaskForm from './AddTaskForm';

interface AddTaskButtonProps {
    onTaskCreate: (newTask: Task) => void;
}

const AddTaskButton = ({ onTaskCreate }: AddTaskButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTaskCreated = (newTask: Task) => {
    onTaskCreate(newTask);
    setIsOpen(false); // Close the dialog after task creation
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <button
                title="add new task"
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <Plus size={28} />
            </button>
        </DialogTrigger>
        {/* The actual form is a child of this component, rendered within the dialog */}
        <AddTaskForm onTaskCreate={handleTaskCreated} onClose={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddTaskButton;
