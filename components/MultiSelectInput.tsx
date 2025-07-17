// components/MultiSelectInput.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types/properties';

interface MultiSelectInputProps {
  options: SelectOption[];
  value: string[];
  onChange: (newValue: string[]) => void;
}

export const MultiSelectInput = ({ options, value, onChange }: MultiSelectInputProps) => {
    const [open, setOpen] = useState(false);
    // Use a Set for efficient lookups to check if an option is selected
    const selectedValues = new Set(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-auto min-h-[2.5rem]">
                    <div className="flex gap-1 flex-wrap">
                        {value.length > 0
                            ? value.map(val => <Badge key={val} variant="secondary" className="font-normal">{val}</Badge>)
                            : <span className="text-muted-foreground font-normal">select options...</span>
                        }
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="search options..." />
                    <CommandEmpty>no option found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => {
                                    const newSelectedValues = new Set(selectedValues);
                                    if (newSelectedValues.has(option.name)) {
                                        newSelectedValues.delete(option.name);
                                    } else {
                                        newSelectedValues.add(option.name);
                                    }
                                    onChange(Array.from(newSelectedValues));
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", selectedValues.has(option.name) ? "opacity-100" : "opacity-0")}/>
                                {option.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
