import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import prisma from '../lib/prisma';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Loader2, Sun, Moon, Monitor } from 'lucide-react';
import { LocalProperty, SelectOption, PropertyType } from '@/types/properties';
import { MultiSelectInput } from '@/components/MultiSelectInput';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { PropertyManager } from '@/components/PropertyManager';


// --- Type Definitions ---
type VisibilitySettings = { [key: string]: boolean; };
type AppearanceSettings = { theme: string; taskSpacing: string; };
type DefaultProperty = { id: string; name: string; type: PropertyType; order: number; options?: SelectOption[] };

interface SettingsPageProps {
  initialVisibility: VisibilitySettings;
  allPropertyNames: string[];
  initialAppearance: AppearanceSettings;
  initialDefaultProperties: DefaultProperty[];
}

// --- Main Page Component ---
const SettingsPage = ({ initialVisibility, allPropertyNames, initialAppearance, initialDefaultProperties }: SettingsPageProps) => {
  const [visibility, setVisibility] = useState<VisibilitySettings>(initialVisibility);
  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
  const [defaultProperties, setDefaultProperties] = useState<LocalProperty[]>(initialDefaultProperties);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(appearance.theme);
  }, [appearance.theme, setTheme]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const finalVisibility = { ...visibility, Duration: true };

      const visibilityPromise = fetch('/api/settings/update-visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalVisibility),
      });
      const appearancePromise = fetch('/api/settings/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearance),
      });
      const defaultPropsPromise = fetch('/api/settings/default-properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultProperties),
      });

      const responses = await Promise.all([visibilityPromise, appearancePromise, defaultPropsPromise]);

      if (responses.some(res => !res.ok)) {
        throw new Error('Failed to save one or more settings');
      }
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      setSaveMessage('Error saving settings.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const userCustomProperties = allPropertyNames.filter(name => name !== 'Duration');
  const selectedProperties = Object.keys(visibility).filter(key => key !== 'Duration' && visibility[key]);
  const propertyOptions: SelectOption[] = userCustomProperties.map(name => ({ id: name, name }));

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your application preferences.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md border dark:border-slate-800">
            <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Property Visibility</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Choose which properties to display on task cards. Duration is a core property and is always visible.
            </p>
            <div className="mt-6">
              <MultiSelectInput
                options={propertyOptions}
                value={selectedProperties}
                onChange={(selected) => setVisibility(allPropertyNames.reduce((acc, name) => ({ ...acc, [name]: selected.includes(name) }), {}))}
              />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md border dark:border-slate-800">
             <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Default Properties</h2>
             <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
               Set up a template of properties for every new task.
             </p>
             <div className="mt-6">
                <PropertyManager
                    properties={defaultProperties}
                    onPropertiesChange={setDefaultProperties}
                    showLabel={false}
                />
             </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md border dark:border-slate-800">
            <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Appearance</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Label className="text-base">Theme</Label>
                    <RadioGroup value={appearance.theme} onValueChange={(v) => setAppearance(p => ({...p, theme: v}))} className="mt-2 grid grid-cols-3 gap-2">
                        <Label htmlFor="theme-light" className="border rounded-md p-3 flex flex-col items-center justify-center cursor-pointer [&:has([data-state=checked])]:border-indigo-500">
                            <Sun className="h-5 w-5 mb-1"/> <span>Light</span>
                            <RadioGroupItem value="light" id="theme-light" className="sr-only"/>
                        </Label>
                        <Label htmlFor="theme-dark" className="border rounded-md p-3 flex flex-col items-center justify-center cursor-pointer [&:has([data-state=checked])]:border-indigo-500">
                            <Moon className="h-5 w-5 mb-1"/> <span>Dark</span>
                            <RadioGroupItem value="dark" id="theme-dark" className="sr-only"/>
                        </Label>
                        <Label htmlFor="theme-system" className="border rounded-md p-3 flex flex-col items-center justify-center cursor-pointer [&:has([data-state=checked])]:border-indigo-500">
                            <Monitor className="h-5 w-5 mb-1"/> <span>System</span>
                            <RadioGroupItem value="system" id="theme-system" className="sr-only"/>
                        </Label>
                    </RadioGroup>
                </div>
                <div>
                    <Label className="text-base">Task Spacing</Label>
                    <RadioGroup value={appearance.taskSpacing} onValueChange={(v) => setAppearance(p => ({...p, taskSpacing: v}))} className="mt-2 grid grid-cols-3 gap-2">
                        <Label htmlFor="spacing-compact" className="border rounded-md p-3 flex items-center justify-center cursor-pointer [&:has([data-state=checked])]:border-indigo-500">
                           <span>Compact</span>
                           <RadioGroupItem value="compact" id="spacing-compact" className="sr-only"/>
                        </Label>
                        <Label htmlFor="spacing-default" className="border rounded-md p-3 flex items-center justify-center cursor-pointer [&:has([data-state=checked])]:border-indigo-500">
                           <span>Default</span>
                           <RadioGroupItem value="default" id="spacing-default" className="sr-only"/>
                        </Label>
                        <Label htmlFor="spacing-comfortable" className="border rounded-md p-3 flex items-center justify-center cursor-pointer [&:has([data-state=checked])]:border-indigo-500">
                           <span>Roomy</span>
                           <RadioGroupItem value="comfortable" id="spacing-comfortable" className="sr-only"/>
                        </Label>
                    </RadioGroup>
                </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end items-center gap-4">
              {saveMessage && <p className="text-sm text-gray-500">{saveMessage}</p>}
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save All Settings
              </Button>
          </div>

        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user?.id) return { redirect: { destination: '/', permanent: false } };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
        propertyVisibility: true,
        theme: true,
        taskSpacing: true,
        defaultProperties: { orderBy: { order: 'asc' } }
    },
  });

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    select: { properties: true },
  });

  const propertyNames = new Set<string>();
  tasks.forEach(task => {
    if (task.properties && Array.isArray(task.properties)) {
      (task.properties as LocalProperty[]).forEach(prop => {
        if (prop.name) propertyNames.add(prop.name);
      });
    }
  });

  const initialVisibility = (user?.propertyVisibility as VisibilitySettings) || {};
  initialVisibility['Duration'] = true;

  return {
    props: {
      session,
      initialVisibility,
      allPropertyNames: Array.from(propertyNames),
      initialAppearance: { theme: user?.theme || 'system', taskSpacing: user?.taskSpacing || 'default' },
      initialDefaultProperties: user?.defaultProperties || [],
    },
  };
};

export default SettingsPage;
