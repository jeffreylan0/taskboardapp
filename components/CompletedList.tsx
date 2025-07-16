import { useState } from 'react';
import { Task } from '../pages/index';
import { RefreshCcw, Trash2 } from 'lucide-react';

interface CompletedListProps {
  tasks: Task[];
  onTaskReopen: (task: Task) => void;
}

const CompletedList = ({ tasks, onTaskReopen }: CompletedListProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReopenClick = async (taskToReopen: Task) => {
    setLoadingId(taskToReopen.id);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskToReopen.id, completed: false }),
      });
      if (!res.ok) {
        throw new Error('Failed to re-open task');
      }
      onTaskReopen(taskToReopen);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h3 className="lowercase text-lg font-bold text-gray-800 dark:text-gray-200">
        {tasks.length} completed tasks
      </h3>
      <ul className="mt-4 space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 line-through">{task.title}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                completed in {task.duration} minutes
              </span>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                title="re-open task"
                disabled={loadingId === task.id}
                onClick={() => handleReopenClick(task)}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {loadingId === task.id ? '...' : <RefreshCcw size={16} />}
              </button>
              <button title="delete permanently" className="p-1 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompletedList;
