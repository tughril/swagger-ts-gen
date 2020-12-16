import { HTTPMethod } from './types';
export interface APIRequest<Response> {
    _response?: Response;
    parameter?: any;
    path: string;
    method: HTTPMethod;
    contentType?: string;
}
