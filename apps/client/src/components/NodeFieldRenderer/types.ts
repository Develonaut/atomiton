import type { NodeFieldConfig } from "@atomiton/nodes/definitions";

export type NodeFieldRendererProps = {
  fieldKey: string;
  fieldConfig: NodeFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
};

export type FieldComponentProps = {
  fieldKey: string;
  config: NodeFieldConfig;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
};
