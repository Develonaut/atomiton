/**
 * Node Port Types
 * Port definitions for node inputs and outputs
 */

/**
 * Node port types
 */
export type NodePortType =
  | "input"
  | "output"
  | "trigger" // Special port type for event-driven nodes
  | "error"; // Error output port

/**
 * Data types for node ports
 */
export type NodePortDataType =
  // Primitive types
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "regex"

  // Composite types
  | "object"
  | "array"
  | "any"
  | "function"

  // Binary types
  | "buffer"
  | "stream"
  | "binary"

  // Document types
  | "json"
  | "xml"
  | "html"
  | "markdown"
  | "csv";

/**
 * Port definition for nodes
 */
export type NodePort = {
  /** Port identifier */
  id: string;

  /** Display name */
  name: string;

  /** Port direction */
  type: NodePortType;

  /** Expected data type */
  dataType: NodePortDataType;

  /** Whether this port is required */
  required?: boolean;

  /** Whether this port accepts multiple connections */
  multiple?: boolean;

  /** Description of what this port does */
  description?: string;

  /** Default value for this port */
  defaultValue?: unknown;
};
