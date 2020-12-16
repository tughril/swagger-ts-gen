import { Spec } from "swagger-schema-official";
import { OperationSchema, DefinitionSchema, ProeprtyNaming } from './types';
export interface CodeGenOptions {
    dist: string;
    modelPropertyNaming: ProeprtyNaming;
    definitionDir: string;
    operationDir: string;
    templates?: {
        operation?: string;
        definition?: string;
    };
}
export declare class Generator {
    private spec;
    private options;
    operationsDir: string;
    definitionDir: string;
    constructor(spec: Spec, options: CodeGenOptions);
    generate(): void;
    parseSpec(): {
        operations: OperationSchema[];
        models: DefinitionSchema[];
    };
    private parseResponse;
    private parsePathParameter;
    private parseQueryParameter;
    private parseBodyParameter;
    private parseFormDataParameter;
    private genFiles;
    private createOperations;
    private createOperationBarrel;
    private createDefinitionBarrel;
    private createDefinitions;
    private registerPartial;
    private registerHelper;
    private embedded;
    get dist(): string;
}
