// types/properties.d.ts

export const propertyTypes = ["TEXT", "NUMBER", "CHECKBOX", "SELECT", "MULTI_SELECT", "DATE", "URL", "EMAIL", "PHONE"] as const;

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
