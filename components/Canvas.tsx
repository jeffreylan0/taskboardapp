import { useState } from 'react';
import { Task } from '../pages/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import TaskModal from './TaskModal';

interface CanvasProps {
  tasks: Task[];
  onTaskComplete: (completedTask: Task) => void;
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskCard = ({ task, onClick }: { task: Task, onClick: () => void }) => {
  // Base height: e.g., 4 pixels per minute. Adjust as needed.
  const cardHeight = task.duration * 4;

  return (
    <motion.button
      onClick={onClick}
      layout
      style={{ height: `${cardHeight}px` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative w-full bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-4 flex flex-col items-center justify-center cursor-pointer aspect-square"
    >
      <span className="text-center font-medium text-gray-800 dark:text-gray-200">{task.title}</span>
      <div className="absolute bottom-2 left-3 flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
        <Clock size={12} />
        <span>{task.duration} min</span>
      </div>
    </motion.button>
  );
};

const Canvas = ({ tasks, onTaskComplete, onTaskUpdate }: CanvasProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </AnimatePresence>
      </div>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={onTaskComplete}
          onUpdate={onTaskUpdate}
        />
      )}
    </>
  );
};

export default Canvas;
