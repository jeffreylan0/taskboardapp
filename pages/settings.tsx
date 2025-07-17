import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Property, PropertyType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast"
import Link from 'next/link';

// --- Create Property Form Component ---
const CreatePropertyForm = ({ onPropertyCreate }: { onPropertyCreate: () => void }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<PropertyType | ''>('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !type) return;

        const res = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type }),
        });

        if (res.ok) {
            toast({ title: "property created", description: `"${name}" was added.` });
            onPropertyCreate(); // Tell the parent to refetch
            setIsOpen(false); // Close the dialog
            setName('');
            setType('');
        } else {
            toast({ variant: "destructive", title: "error", description: "failed to create property." });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> create property
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>create new property</DialogTitle>
                        <DialogDescription>
                            this property will be available to add to any task.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">type</Label>
                            <Select onValueChange={(value) => setType(value as PropertyType)} value={type}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PropertyType).map(pt => <SelectItem key={pt} value={pt}>{pt.toLowerCase()}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!name || !type}>create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


// --- Main Settings Page Component ---
const SettingsPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  const fetchProperties = async () => {
    const res = await fetch('/api/properties');
    if (res.ok) {
      const data = await res.json();
      setProperties(data);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">settings</h1>
          <p className="text-muted-foreground">manage your custom task properties.</p>
        </div>
        <CreatePropertyForm onPropertyCreate={fetchProperties} />
      </div>
      
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">property name</TableHead>
              <TableHead>type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((prop) => (
              <TableRow key={prop.id}>
                <TableCell className="font-medium">{prop.name}</TableCell>
                <TableCell><span className='text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full'>{prop.type.toLowerCase()}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
          {properties.length === 0 && <TableCaption>you haven't created any properties yet.</TableCaption>}
        </Table>
      </div>
      
      <Link href="/" className="mt-8 text-indigo-600 hover:underline inline-block">
        ← return to dashboard
      </Link>
    </div>
  );
};

export default SettingsPage;
