// types/properties.d.ts

// The 'const' has been removed from this file.
export type PropertyType = "TEXT" | "NUMBER" | "CHECKBOX" | "SELECT" | "MULTI_SELECT" | "DATE" | "URL" | "EMAIL" | "PHONE";

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
