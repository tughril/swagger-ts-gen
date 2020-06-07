export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "HEAD"
  | "DELETE"
  | "PATCH"
  | "TRACE"
  | "OPTIONS"
  | "CONNECT"
  | "get"
  | "post"
  | "put"
  | "head"
  | "delete"
  | "patch"
  | "trace"
  | "options"
  | "connect";

export interface APIRequest<Response> {
  _response?: Response;
  bodyParameter?: any;
  queryParameter?: any;
  path: string;
  method: HTTPMethod;
}
