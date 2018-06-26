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
