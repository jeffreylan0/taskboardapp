/**
 * @file lib/constants.ts
 * @description Shared runtime constants used across the application.
 */

// This constant array is the single source of truth for all valid property types.
// It can be imported into both frontend components and backend API routes for validation and UI generation.
export const propertyTypes = ["TEXT", "NUMBER", "CHECKBOX", "SELECT", "MULTI_SELECT", "DATE", "URL", "EMAIL", "PHONE"] as const;
