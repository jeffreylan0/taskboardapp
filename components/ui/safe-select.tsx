import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

// A unique, non-empty string to use as a placeholder for the empty value.
const EMPTY_VALUE_PLACEHOLDER = '__EMPTY_VALUE_PLACEHOLDER__';

/**
 * A wrapper around the shadcn/ui Select component that safely handles
 * empty string values, preventing the common "value prop cannot be empty" error.
 */
const SafeSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>
>(({ value, onValueChange, ...props }, ref) => {
  const internalValue = value === '' ? EMPTY_VALUE_PLACEHOLDER : value;

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue === EMPTY_VALUE_PLACEHOLDER ? '' : newValue);
    }
  };

  return (
    <Select
      value={internalValue}
      onValueChange={handleValueChange}
      {...props}
    />
  );
});
SafeSelect.displayName = 'SafeSelect';

// We also need to re-export the other parts of the Select component
// so they can be used with our SafeSelect.
const SafeSelectTrigger = SelectTrigger;
const SafeSelectContent = SelectContent;
const SafeSelectItem = SelectItem;

export { SafeSelect, SafeSelectTrigger, SafeSelectContent, SafeSelectItem };
