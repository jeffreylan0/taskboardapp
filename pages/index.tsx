import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Canvas from '../components/Canvas';
import CompletedList from '../components/CompletedList';
import AddTaskButton from '../components/AddTaskButton';
import { useState, useEffect } from 'react';

// Define Task type for TypeScript
export interface Task {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  createdAt: string;
}

const LandingPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <h1 className="text-5xl font-bold text-black">taskboard</h1>
    <p className="mt-2 text-lg italic text-gray-500">life manager</p>
    <button
      onClick={() => signIn('google')}
      className="mt-8 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-3" />
      sign in with google
    </button>
  </div>
);

const Dashboard = () => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    if (res.ok) {
      const data = await res.json();
      setTasks(data.active);
      setCompletedTasks(data.completed);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  // This function will now correctly move the task between lists
  const handleTaskComplete = (completedTask: Task) => {
    setTasks(prev => prev.filter(t => t.id !== completedTask.id));
    setCompletedTasks(prev => [completedTask, ...prev]);
  };

  // NEW: This function handles in-place editing of a task
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* ... (welcome message) */}
          <div className="mt-12">
            <h3 className="text-lg font-bold dark:text-gray-200">
              {tasks.length} active tasks
            </h3>
            <Canvas 
              tasks={tasks} 
              onTaskComplete={handleTaskComplete}
              onTaskUpdate={handleTaskUpdate} 
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

const handleTaskReopen = (reopenedTask: Task) => {
  setCompletedTasks(prev => prev.filter(t => t.id !== reopenedTask.id));
  setTasks(prev => [{ ...reopenedTask, completed: false }, ...prev]);
};

return (
  <div className="min-h-screen">
    <Header />
    <main className="pt-24 px-4 sm:px-6 lg:px-8">
      {/* ... */}
      <div className="mt-16">
        <CompletedList 
          tasks={completedTasks} 
          onTaskReopen={handleTaskReopen} // Pass the new handler here
        />
      </div>
    </main>
    <AddTaskButton onTaskCreate={handleTaskCreate} />
  </div>
);

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-white" />; // Clean loading state
  }

  return (
    <>
      <Head>
        <title>taskboard</title>
        <meta name="description" content="a minimalist life manager" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? <Dashboard /> : <LandingPage />}
    </>
  );
}
