import Link from 'next/link';

const SettingsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">settings</h1>
      <p className="mt-2 text-lg text-gray-500">(coming soon)</p>
      <Link href="/" className="mt-8 text-indigo-600 hover:underline">
        return to dashboard
      </Link>
    </div>
  );
};

export default SettingsPage;
