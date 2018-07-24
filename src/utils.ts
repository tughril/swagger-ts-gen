import {
  BaseSchema,
  BodyParameter,
  Operation,
  Parameter,
  PathParameter,
  QueryParameter,
  Schema as SwaggerSchema
} from "swagger-schema-official";
import { TSSchema, SwaggerSchemaType, SwaggerSchemaFormat } from "./types";

// Map swagger types to typescript definitions
// [swagger-type:typescript-type]
export const typeMap: { [key: string]: string } = {
  Array: "Array",
  array: "Array",
  List: "Array",
  boolean: "boolean",
  string: "string",
  int: "number",
  float: "number",
  number: "number",
  long: "number",
  short: "number",
  char: "string",
  double: "number",
  object: "any",
  integer: "number",
  Map: "any",
  date: "string",
  DateTime: "Date",
  binary: "string", // TODO: binary should be mapped to byte array
  ByteArray: "string",
  UUID: "string",
  File: "any",
  Error: "Error" // TODO: Error is not same as the Javascript Error
};

// Map swagger types to typescript definitions
// [swagger-type:typescript-type]
export const formatMap: Record<SwaggerSchemaType, string> = {
  Array: "Array",
  array: "Array",
  List: "Array",
  boolean: "boolean",
  string: "string",
  int64: "number",
  float: "number",
  number: "number",
  long: "number",
  short: "number",
  char: "string",
  double: "number",
  object: "any",
  integer: "number",
  Map: "any",
  date: "string",
  DateTime: "Date",
  binary: "string", // TODO: binary should be mapped to byte array
  ByteArray: "string",
  UUID: "string",
  File: "any",
  Error: "Error" // TODO: Error is not same as the Javascript Error
};

export function mapType(type?: SwaggerSchemaType, format?: SwaggerSchemaFormat): string {
  if (!type) {
    return "any";
  }

  if (type === "string" && format === "int64") {
    // TODO: use options
    return "number";
  }

  return typeMap[type || ""] || "any";
}

/**
 * Get ref names from ref path
 * @param schema
 */
export function getRefName(ref: string): string {
  const seguments = ref.split("/");
  return seguments[seguments.length - 1];
}

/**
 * Check type is BodyParameter with type guard
 */
export function isBodyParameter(parameter: Parameter): parameter is BodyParameter {
  return parameter.in === "body";
}

/**
 * Check type is PathParameter with type guard
 */
export function isPathParameter(parameter: Parameter): parameter is PathParameter {
  return parameter.in === "path";
}

/**
 * Check type is QueryParameter with type guard
 */
export function isQueryParameter(parameter: Parameter): parameter is QueryParameter {
  return parameter.in === "query";
}

/**
 * Check paramter is required
 */
export function isRequired(schema: SwaggerSchema, key: string): boolean {
  return (schema.required || []).indexOf(key) !== -1;
}

/**
 * Check passed object is schema or not
 * @param schemaOrBaseSchema
 */
export function isSchema(
  schemaOrBaseSchema: BaseSchema | SwaggerSchema
): schemaOrBaseSchema is SwaggerSchema {
  const schema: SwaggerSchema = schemaOrBaseSchema as SwaggerSchema;
  return (
    schema.$ref !== undefined ||
    schema.allOf !== undefined ||
    schema.additionalProperties !== undefined ||
    schema.properties !== undefined ||
    schema.discriminator !== undefined ||
    schema.readOnly !== undefined ||
    schema.xml !== undefined ||
    schema.externalDocs !== undefined ||
    schema.example !== undefined ||
    schema.required !== undefined
  );
}

/**
 * Create operation name
 * @param method
 * @param operation
 */
export function createOperationName(method: string, operation: Operation): string {
  // TODO: create operation name
  return operation.operationId || method;
}

/**
 * Create default schema
 */
export function emptySchema(): TSSchema {
  return {
    type: "void",
    isRequired: false,
    isRef: false,
    isArray: false,
    properties: {},
    enum: []
  };
}

/**
 * snake to camel case
 * @param str
 */
export function snakeToCamel(str: string) {
  return str.replace(/_+(\w){1}|-+(\w){1}/g, (_, group1, group2) => {
    var letter = group1 || group2;
    return letter.toUpperCase();
  });
}

/**
 * camel to snake case
 * @param str
 */
export function camelToSnake(str: string) {
  return str
    .replace(/([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g, (_, group1, group2) => {
      return group1 + (group2 && "_" + group2);
    })
    .toLowerCase();
}
