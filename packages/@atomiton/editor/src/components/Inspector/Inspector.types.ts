import type { StyleProps } from "@/types";

/**
 * Field type for form inputs
 */
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "checkbox"
  | "color"
  | "range";

/**
 * Field definition for dynamic forms
 */
export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  value?: unknown;
  placeholder?: string;
  options?: Array<{ value: unknown; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  validation?: (value: unknown) => string | null;
}

/**
 * Section definition for organizing fields
 */
export interface SectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FieldDefinition[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Props for the root Inspector component
 */
export interface InspectorProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Selected item/element ID
   */
  selectedId?: string;
  /**
   * Item data to inspect
   */
  data?: Record<string, unknown>;
  /**
   * Field definitions for dynamic form generation
   */
  fields?: FieldDefinition[];
  /**
   * Section definitions for organized form
   */
  sections?: SectionDefinition[];
  /**
   * Whether the inspector is editable
   */
  readonly?: boolean;
  /**
   * Called when a field value changes
   */
  onFieldChange?: (key: string, value: unknown) => void;
  /**
   * Called when multiple fields change
   */
  onDataChange?: (data: Record<string, unknown>) => void;
  /**
   * Called when an action is triggered
   */
  onAction?: (action: string, data?: unknown) => void;
}

/**
 * Props for Inspector.Header sub-component
 */
export interface InspectorHeaderProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Header title
   */
  title?: string;
  /**
   * Subtitle or additional info
   */
  subtitle?: string;
  /**
   * Header icon
   */
  icon?: React.ReactNode;
  /**
   * Optional actions in the header
   */
  actions?: React.ReactNode;
}

/**
 * Props for Inspector.Sections sub-component
 */
export interface InspectorSectionsProps extends StyleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for Inspector.Section sub-component
 */
export interface InspectorSectionProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Section title
   */
  title: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Section icon
   */
  icon?: React.ReactNode;
  /**
   * Whether the section is collapsible
   */
  collapsible?: boolean;
  /**
   * Default collapsed state
   */
  defaultCollapsed?: boolean;
  /**
   * Controlled collapsed state
   */
  collapsed?: boolean;
  /**
   * Called when collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Props for Inspector.Field sub-component
 */
export interface InspectorFieldProps extends StyleProps {
  className?: string;
  /**
   * Field definition
   */
  field: FieldDefinition;
  /**
   * Current field value
   */
  value?: unknown;
  /**
   * Whether the field is readonly
   */
  readonly?: boolean;
  /**
   * Called when field value changes
   */
  onChange?: (value: unknown) => void;
  /**
   * Field validation error
   */
  error?: string;
}

/**
 * Props for Inspector.Actions sub-component
 */
export interface InspectorActionsProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Actions alignment
   */
  align?: "left" | "center" | "right" | "between";
  /**
   * Actions spacing
   */
  spacing?: "sm" | "md" | "lg";
}

/**
 * Props for Inspector.Empty sub-component
 */
export interface InspectorEmptyProps extends StyleProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Empty state icon
   */
  icon?: React.ReactNode;
  /**
   * Empty state title
   */
  title?: string;
  /**
   * Empty state description
   */
  description?: string;
  /**
   * Optional actions for empty state
   */
  actions?: React.ReactNode;
}
