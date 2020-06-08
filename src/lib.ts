import { HTTPMethod } from './types';

export interface APIRequest<Response> {
  _response?: Response;
  bodyParameter?: any;
  queryParameter?: any;
  path: string;
  method: HTTPMethod;
}
