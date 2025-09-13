import type {
  DocumentOptions,
  ParseOptions,
  SchemaOptions,
  ToStringOptions,
} from "yaml";

export type YamlParseOptions = ParseOptions & SchemaOptions & DocumentOptions;

export type YamlStringifyOptions = DocumentOptions &
  SchemaOptions &
  ToStringOptions;

export type YamlValue =
  | string
  | number
  | boolean
  | null
  | YamlObject
  | YamlArray;

export type YamlObject = {
  [key: string]: YamlValue;
};

export type YamlArray = YamlValue[];

export type YamlDocument = YamlObject | YamlArray;

export type ParseResult<T = YamlDocument> = {
  data: T;
  errors?: YamlError[];
  warnings?: YamlWarning[];
};

export type YamlError = {
  message: string;
  line?: number;
  column?: number;
  path?: string[];
};

export type YamlWarning = {
  message: string;
  line?: number;
  column?: number;
  path?: string[];
};

export type StreamParseOptions = YamlParseOptions & {
  onDocument?: (doc: YamlDocument, index: number) => void;
  onError?: (error: YamlError) => void;
};

export type ValidationSchema<T = YamlDocument> = {
  validate: (data: unknown) => data is T;
  errors?: YamlError[];
};
