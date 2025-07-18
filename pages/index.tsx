import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Canvas from '../components/Canvas';
import CompletedList from '../components/CompletedList';
import AddTaskButton from '../components/AddTaskButton';
import { useState, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { LocalProperty } from '@/types/properties';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';

// The shared Task type definition, now including properties
export interface Task {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  createdAt: string; // Must be a string for serialization
  properties?: LocalProperty[] | null;
}

type VisibilitySettings = {
  [key: string]: boolean;
};

// --- Component for Unauthenticated Users ---
const LandingPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
    <h1 className="text-5xl font-bold text-black dark:text-white">taskboard</h1>
    <p className="mt-2 text-lg italic text-gray-500 dark:text-gray-400">life manager</p>
    <button
      onClick={() => signIn('google')}
      className="mt-8 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-3" />
      sign in with google
    </button>
  </div>
);

// --- Component for Authenticated Users ---
interface DashboardProps {
  initialTasks: Task[];
  initialCompletedTasks: Task[];
  propertyVisibility: VisibilitySettings;
  sortOptions: { label: string; value: string; isProperty?: boolean }[];
  taskSpacing: string;
}

const Dashboard = ({ initialTasks, initialCompletedTasks, propertyVisibility, sortOptions, taskSpacing }: DashboardProps) => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completedTasks, setCompletedTasks] = useState<Task[]>(initialCompletedTasks);
  const [sortKey, setSortKey] = useState<string | null>('duration-desc');

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskComplete = (completedTask: Task) => {
    setTasks(prev => prev.filter(t => t.id !== completedTask.id));
    setCompletedTasks(prev => [completedTask, ...prev]);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskReopen = (reopenedTask: Task) => {
    setCompletedTasks(prev => prev.filter(t => t.id !== reopenedTask.id));
    setTasks(prev => [{ ...reopenedTask, completed: false }, ...prev]);
  };

  const sortedTasks = useMemo(() => {
    let sortableItems = [...tasks];
    if (!sortKey) return sortableItems;

    const [key, direction] = sortKey.split('-');

    sortableItems.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (key) {
        case 'duration':
          valA = a.duration;
          valB = b.duration;
          break;
        case 'createdAt':
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
          break;
        case 'alphabetical':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        default: // Handle custom properties
          const getPropValue = (task: Task) => {
            if (!task.properties) return null;
            const prop = task.properties.find(p => p.name === key);
            return prop ? prop.value : null;
          };
          valA = getPropValue(a);
          valB = getPropValue(b);
      }

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (valA < valB) {
        comparison = -1;
      } else if (valA > valB) {
        comparison = 1;
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sortableItems;
  }, [tasks, sortKey]);

  const customSortOptions = sortOptions.filter(opt => opt.isProperty);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 px-4 sm:px-6 lg:px-8" data-spacing={taskSpacing}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl text-gray-600 dark:text-gray-400 text-center">
            welcome, {session?.user?.name?.split(' ')[0].toLowerCase()}
          </h2>
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {tasks.length} active tasks
                </h3>
                <div className="flex items-center gap-2">
                    <Select value={sortKey ?? undefined} onValueChange={setSortKey}>
                        <SelectTrigger className="w-[200px] h-9">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {sortOptions.filter(opt => !opt.isProperty).map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectGroup>
                            {customSortOptions.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>Your Properties</SelectLabel>
                                    {customSortOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Canvas
              tasks={sortedTasks}
              onTaskComplete={handleTaskComplete}
              onTaskUpdate={handleTaskUpdate}
              propertyVisibility={propertyVisibility}
              taskSpacing={taskSpacing}
            />
          </div>
          <div className="mt-16">
            <CompletedList
              tasks={completedTasks}
              onTaskReopen={handleTaskReopen}
            />
          </div>
        </div>
      </main>
      <AddTaskButton onTaskCreate={handleTaskCreate} />
    </div>
  );
};

// --- Main Page Component ---
export default function Home({ pageProps }: { pageProps: DashboardProps | {} }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-white dark:bg-black" />;
  }

  return (
    <>
      <Head>
        <title>taskboard</title>
        <meta name="description" content="a minimalist life manager" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? <Dashboard {...(pageProps as DashboardProps)} /> : <LandingPage />}
    </>
  );
}

// --- Server-Side Data Fetching ---
export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || !session.user?.id) {
        return { props: { pageProps: {} } };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { propertyVisibility: true, taskSpacing: true },
    });

    const tasksFromDb = await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    const tasks = tasksFromDb.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        // FIX: Explicitly cast the 'properties' field to the type expected by the frontend.
        // This is safe because we control the data being saved to this field.
        properties: task.properties as LocalProperty[] | null,
    }));

    const sortOptions: { label: string; value: string; isProperty?: boolean }[] = [
        { label: 'Duration (High to Low)', value: 'duration-desc' },
        { label: 'Duration (Low to High)', value: 'duration-asc' },
        { label: 'Date Created (Newest)', value: 'createdAt-desc' },
        { label: 'Date Created (Oldest)', value: 'createdAt-asc' },
        { label: 'Alphabetical (A-Z)', value: 'alphabetical-asc' },
        { label: 'Alphabetical (Z-A)', value: 'alphabetical-desc' },
    ];

    const customProperties = new Set<string>();
    tasks.forEach(task => {
        if (task.properties && Array.isArray(task.properties)) {
            (task.properties as LocalProperty[]).forEach(prop => {
                if (prop.type === 'NUMBER' || prop.type === 'DATE' || prop.type === 'SELECT') {
                    customProperties.add(prop.name);
                }
            });
        }
    });

    customProperties.forEach(propName => {
        sortOptions.push({ label: `${propName} (High to Low)`, value: `${propName}-desc`, isProperty: true });
        sortOptions.push({ label: `${propName} (Low to High)`, value: `${propName}-asc`, isProperty: true });
    });

    const pageProps: DashboardProps = {
        initialTasks: tasks.filter(t => !t.completed),
        initialCompletedTasks: tasks.filter(t => t.completed),
        propertyVisibility: (user?.propertyVisibility as VisibilitySettings) || {},
        sortOptions,
        taskSpacing: user?.taskSpacing || 'default',
    };

    return {
        props: {
            pageProps
        },
    };
};
