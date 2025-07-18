// types/properties.d.ts
import { propertyTypes } from "@/lib/constants";

// The PropertyType is now derived from the runtime constant, ensuring they always match.
export type PropertyType = typeof propertyTypes[number];

export type SelectOption = {
  id: string;
  name: string;
  color?: string;
};

export type LocalProperty = {
  id: string;
  name: string;
  type: PropertyType;
  value: any;
  options?: SelectOption[];
};
