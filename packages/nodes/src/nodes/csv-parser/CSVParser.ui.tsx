/**
 * CSV Parser UI Component - Pure display and user interaction
 *
 * NO BUSINESS LOGIC ALLOWED IN THIS FILE
 * This file contains only the visual representation and user configuration
 */

import { NumberInput, Select, Stack, Switch, TextInput } from "@mantine/core";
import { IconFileText } from "@tabler/icons-react";
import React from "react";

import type { BaseNodeUIConfig, BaseNodeUIProps } from "../../base/BaseNodeUI";
import {
  CATEGORY_COLORS,
  createBaseNodeComponent,
} from "../../base/BaseNodeUI";
import type { NodeUIComponent } from "../../base/NodePackage";
import type { PortDefinition } from "../../types";

/**
 * CSV Parser UI Data Interface
 */
export interface CSVParserUIData {
  label: string;
  subtitle?: string;
  description?: string;
  category: "data";
  status?: "idle" | "running" | "success" | "error" | "warning";
  progress?: number;
  error?: string;
  config?: {
    delimiter?: string;
    quote?: string;
    escape?: string;
    hasHeaders?: boolean;
    skipEmptyLines?: boolean;
    trimFields?: boolean;
    encoding?: "utf8" | "ascii" | "latin1";
    maxRows?: number;
    validateData?: boolean;
    outputFormat?: "objects" | "arrays";
  };
}

/**
 * CSV Parser UI Props
 */
export interface CSVParserUIProps extends BaseNodeUIProps {
  data: CSVParserUIData;
}

/**
 * Node definition for UI configuration
 */
const nodeDefinition = {
  name: "CSV Parser",
  description:
    "Parse CSV data into structured records with configurable options",
  version: "2.0.0",
  inputPorts: [
    {
      id: "csv_data",
      name: "CSV Data",
      type: "input",
      dataType: "string",
      required: true,
      multiple: false,
      description: "Raw CSV data as string",
    },
    {
      id: "headers",
      name: "Custom Headers",
      type: "input",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Optional custom column headers",
    },
  ] as PortDefinition[],
  outputPorts: [
    {
      id: "records",
      name: "Records",
      type: "output",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Parsed CSV records as array of objects",
    },
    {
      id: "headers",
      name: "Headers",
      type: "output",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Column headers extracted from CSV",
    },
    {
      id: "row_count",
      name: "Row Count",
      type: "output",
      dataType: "number",
      required: true,
      multiple: false,
      description: "Number of data rows parsed",
    },
    {
      id: "metadata",
      name: "Parsing Metadata",
      type: "output",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Additional parsing information and statistics",
    },
  ] as PortDefinition[],
};

/**
 * UI Configuration
 */
const uiConfig: BaseNodeUIConfig = {
  nodeDefinition,
  categoryColor: CATEGORY_COLORS.data,
  defaultIcon: ({ size }: { size?: number }) => (
    <IconFileText size={size || 16} />
  ),
  showConfigByDefault: false,
};

/**
 * Configuration Panel Component
 * Handles all user interaction for node configuration
 */
function CSVParserConfigPanel({
  localConfig,
  updateConfig,
}: {
  localConfig: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <Stack gap="xs">
      {/* Basic Parsing Options */}
      <TextInput
        size="xs"
        label="Delimiter"
        value={(localConfig.delimiter as string) || ","}
        onChange={(e) => updateConfig("delimiter", e.target.value)}
        description="Character that separates fields"
        placeholder=","
        styles={{
          input: { fontFamily: "monospace" },
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <TextInput
        size="xs"
        label="Quote Character"
        value={(localConfig.quote as string) || '"'}
        onChange={(e) => updateConfig("quote", e.target.value)}
        description="Character used to quote fields"
        placeholder='"'
        styles={{
          input: { fontFamily: "monospace" },
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <TextInput
        size="xs"
        label="Escape Character"
        value={(localConfig.escape as string) || "\\"}
        onChange={(e) => updateConfig("escape", e.target.value)}
        description="Character used to escape quotes"
        placeholder="\\"
        styles={{
          input: { fontFamily: "monospace" },
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      {/* Boolean Options */}
      <Switch
        size="xs"
        label="Has Headers"
        description="First row contains column headers"
        checked={(localConfig.hasHeaders as boolean) ?? true}
        onChange={(e) => updateConfig("hasHeaders", e.target.checked)}
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <Switch
        size="xs"
        label="Skip Empty Lines"
        description="Ignore empty or whitespace-only lines"
        checked={(localConfig.skipEmptyLines as boolean) ?? true}
        onChange={(e) => updateConfig("skipEmptyLines", e.target.checked)}
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <Switch
        size="xs"
        label="Trim Fields"
        description="Remove whitespace from field values"
        checked={(localConfig.trimFields as boolean) ?? true}
        onChange={(e) => updateConfig("trimFields", e.target.checked)}
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <Switch
        size="xs"
        label="Validate Data"
        description="Check for data inconsistencies"
        checked={(localConfig.validateData as boolean) ?? true}
        onChange={(e) => updateConfig("validateData", e.target.checked)}
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      {/* Advanced Options */}
      <Select
        size="xs"
        label="Encoding"
        value={(localConfig.encoding as string) || "utf8"}
        onChange={(value) => updateConfig("encoding", value)}
        data={[
          { value: "utf8", label: "UTF-8" },
          { value: "ascii", label: "ASCII" },
          { value: "latin1", label: "Latin-1" },
        ]}
        description="Text encoding of the CSV data"
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <Select
        size="xs"
        label="Output Format"
        value={(localConfig.outputFormat as string) || "objects"}
        onChange={(value) => updateConfig("outputFormat", value)}
        data={[
          { value: "objects", label: "Objects (key-value pairs)" },
          { value: "arrays", label: "Arrays (positional values)" },
        ]}
        description="How to structure the parsed records"
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />

      <NumberInput
        size="xs"
        label="Max Rows"
        value={(localConfig.maxRows as number) || undefined}
        onChange={(value) =>
          updateConfig("maxRows", value ? Number(value) : undefined)
        }
        min={1}
        max={1000000}
        description="Maximum number of rows to parse (optional)"
        placeholder="All rows"
        styles={{
          label: { fontSize: "10px" },
          description: { fontSize: "9px" },
        }}
      />
    </Stack>
  );
}

/**
 * CSV Parser UI Component
 * Pure display component with no business logic
 */
const CSVParserUIComponent = createBaseNodeComponent(
  uiConfig,
  CSVParserConfigPanel,
);

/**
 * Compatibility wrapper to adapt generic NodeUIProps to BaseNodeUIProps
 */
const CSVParserUIWrapper: NodeUIComponent<Record<string, unknown>> = (
  props,
) => {
  const baseProps: BaseNodeUIProps = {
    ...props,
    data: {
      label: "CSV Parser",
      subtitle: "Parse CSV data",
      description: "Convert CSV text into structured data records",
      category: "data",
      icon: "file-csv",
      status: "idle",
      ...props.data,
    },
  };
  return CSVParserUIComponent(baseProps) as React.ReactElement;
};

export const CSVParserUI = CSVParserUIWrapper;

// Set display name for debugging
CSVParserUI.displayName = "CSVParserUI";
