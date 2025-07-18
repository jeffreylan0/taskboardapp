import { useState } from 'react';
import { Task } from '../pages/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Hash, Type, Calendar, Link, Mail, Phone, CheckSquare } from 'lucide-react';
import TaskModal from './TaskModal';
import { LocalProperty } from '@/types/properties';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type VisibilitySettings = {
  [key: string]: boolean;
};

interface CanvasProps {
  tasks: Task[];
  onTaskComplete: (completedTask: Task) => void;
  onTaskUpdate: (updatedTask: Task) => void;
  propertyVisibility: VisibilitySettings;
  taskSpacing: string;
}

const PropertyDisplay = ({ property }: { property: LocalProperty }) => {
    const renderIcon = () => {
        switch (property.type) {
            case 'NUMBER': return <Hash size={12} />;
            case 'DATE': return <Calendar size={12} />;
            case 'URL': return <Link size={12} />;
            case 'EMAIL': return <Mail size={12} />;
            case 'PHONE': return <Phone size={12} />;
            case 'CHECKBOX': return <CheckSquare size={12} />;
            default: return <Type size={12} />;
        }
    };

    const renderValue = () => {
        if (property.type === 'CHECKBOX') {
            return <input type="checkbox" checked={!!property.value} readOnly className="h-3 w-3" />;
        }
        if (property.type === 'SELECT' && property.value) {
            return <Badge variant="secondary" className="text-xs font-normal">{property.value}</Badge>;
        }
        if (property.type === 'MULTI_SELECT' && Array.isArray(property.value) && property.value.length > 0) {
            return (
                <div className="flex flex-wrap gap-1 justify-center">
                    {property.value.map((val: string) => <Badge key={val} variant="secondary" className="text-xs font-normal">{val}</Badge>)}
                </div>
            );
        }
        if (property.value) {
           return <span className="truncate text-xs">{property.value.toString()}</span>;
        }
        return null;
    };

    if (!property.value || (Array.isArray(property.value) && property.value.length === 0)) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400">
            {renderIcon()}
            {renderValue()}
        </div>
    );
};


const TaskCard = ({ task, onClick, visibleProperties }: { task: Task, onClick: () => void, visibleProperties: LocalProperty[] }) => {
  const cardHeight = task.duration * 4;
  const hasVisibleProperties = visibleProperties.length > 0;

  return (
    <motion.button
      onClick={onClick}
      layout
      style={{ height: `${Math.max(cardHeight, 120)}px` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      // FIX: The main container is now always centered.
      className="relative w-full bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-4 flex flex-col justify-center items-center cursor-pointer aspect-square"
    >
        {/* This inner div contains the title and any visible properties */}
        <div className="w-full text-center">
            <span className="font-medium text-gray-800 dark:text-gray-200">{task.title}</span>

            {/* Render custom properties below the title only if they are visible */}
            {hasVisibleProperties && (
                <div className="mt-2 space-y-1">
                    {visibleProperties.map(prop => <PropertyDisplay key={prop.id} property={prop} />)}
                </div>
            )}
        </div>

        {/* FIX: Duration is now absolutely positioned to always be in the bottom-left corner */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} />
            <span>{task.duration} min</span>
        </div>
    </motion.button>
  );
};

const Canvas = ({ tasks, onTaskComplete, onTaskUpdate, propertyVisibility, taskSpacing }: CanvasProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const spacingClasses: { [key: string]: string } = {
    compact: 'gap-2',
    default: 'gap-4',
    comfortable: 'gap-6',
  };
  const gridGapClass = spacingClasses[taskSpacing] || spacingClasses.default;

  return (
    <>
      <div className={`mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${gridGapClass}`}>
        <AnimatePresence>
          {tasks.map((task) => {
            const visibleProperties = (task.properties || []).filter(p => p.name !== 'Duration' && propertyVisibility[p.name] && p.value);
            return (
                <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    visibleProperties={visibleProperties}
                />
            );
          })}
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
