// types/properties.d.ts
import { propertyTypes } from "@/lib/constants";

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
  value?: any; // FIX: Made the value optional
  options?: SelectOption[];
};
