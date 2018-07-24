export type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH";

export interface TSSchema {
  type: string;
  isRequired: boolean;
  isRef: boolean;
  isArray: boolean;
  enum: any[];
  properties: { [name: string]: TSSchema };
}

export interface OperationSchema {
  name: string;
  path: string;
  method: HTTPMethod;
  pathParameter?: TSSchema;
  queryParameter?: TSSchema;
  bodyParameter?: TSSchema;
  response?: TSSchema;
}

export interface DefinitionSchema {
  name: string;
  schema: TSSchema;
}

export interface Context {
  definitions: DefinitionSchema[];
  operations: OperationSchema[];
}

export interface GenCodeRequest {
  filepath: string;
  content: string;
}

export type SwaggerSchemaFormat =
  | "int32"
  | "int64"
  | "float"
  | "double"
  | "byte"
  | "date"
  | "date-time";

export type SwaggerSchemaType =
  | "Array"
  | "array"
  | "List"
  | "boolean"
  | "string"
  | "int64"
  | "float"
  | "number"
  | "long"
  | "short"
  | "char"
  | "double"
  | "object"
  | "integer"
  | "Map"
  | "date"
  | "DateTime"
  | "binary"
  | "ByteArray"
  | "UUID"
  | "File"
  | "Error";
