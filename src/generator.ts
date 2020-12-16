import * as fs from "fs";
import * as path from "path";
import Handlebars from "handlebars";
import {
  Operation,
  Spec,
  Response,
  Parameter
} from "swagger-schema-official";
import {
  isBodyParameter,
  isPathParameter,
  isQueryParameter,
  createOperationName,
  emptySchema,
  isFormDataParameter, 
  normalizeNaming 
} from "./utils";
import { HTTPMethod, OperationSchema, GenCodeRequest, DefinitionSchema, TSSchema, ProeprtyNaming } from './types';
import mapTS from "./map-ts";
import { enumerate, responseName } from './utils';

/**
 * Options for TSCodeGenerator
 */
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

/**
 * Generator is code generator for typescript
 *
 * TODO: Handle security schema
 * TODO: Handle shared parameter
 */
export class Generator {
  operationsDir: string;
  definitionDir: string;

  constructor(private spec: Spec, private options: CodeGenOptions) {
    this.operationsDir = options.operationDir;
    this.definitionDir = options.definitionDir;
  }

  generate() {
    if (this.spec.swagger !== "2.0") {
      throw new Error(`Only 2.0 is supported. Your version: ${this.spec.swagger}`);
    }

    // Parse spec
    const data = this.parseSpec();

    // Setup templates
    const templates = this.options.templates || {};
    const definitionTmpl =
      templates.definition ||
      fs.readFileSync(path.resolve(__dirname, "../templates/definition.hbs"), "utf-8");
    const operationTmpl =
      templates.operation ||
      fs.readFileSync(path.resolve(__dirname, "../templates/operation.hbs"), "utf-8");
    const barrelTmpl = 
      fs.readFileSync(path.resolve(__dirname, "../templates/barrel.hbs"), "utf-8");

    // Register partial for handlebars
    this.registerPartial();
    this.registerHelper();

    // Setup output directory
    const operationDir = path.resolve(this.dist, this.operationsDir);
    const definitionDir = path.resolve(this.dist, this.definitionDir);
    if (!fs.existsSync(this.dist)) {
      fs.mkdirSync(this.dist);
    }
    if (data.operations.length > 0 && !fs.existsSync(operationDir)) {
      fs.mkdirSync(operationDir);
    }
    if (data.models.length > 0 && !fs.existsSync(definitionDir)) {
      fs.mkdirSync(definitionDir);
    }

    // Create files and write schema
    this.genFiles([
      ...this.createDefinitions(
        data.models,
        Handlebars.compile(definitionTmpl),
        definitionDir
      ),
      this.createDefinitionBarrel(
        data.models,
        Handlebars.compile(barrelTmpl),
        definitionDir
      ),
      ...this.createOperations(data.operations, Handlebars.compile(operationTmpl), operationDir),
      this.createOperationBarrel(
        data.operations,
        Handlebars.compile(barrelTmpl),
        operationDir
      ),
    ]);
  }

  /**
   * Parse swagger this.spec
   */
  parseSpec() {
    // Parse models
    const models: DefinitionSchema[] = [
      // Parse definitions
      ...enumerate(this.spec.definitions || {})
      .map(({ key, value }) => ({
        name: key,
        schema: mapTS(value),
      })),
      // Parse reusable responses
      ...enumerate(this.spec.responses || {})
      .map(({ key, value }) => ({
        name: responseName(key),
        schema: mapTS(value.schema!),
      }))
    ];

    // Parse operations
    const operations = enumerate(this.spec.paths).reduce((result, { key, value }) => {
      const content = value;
      const path = key;

      // Remove parameters
      delete content.parameters;

      // Loop for Operation
      const operations = Object.keys(content).reduce((result: any, m) => {
        let method = m.toUpperCase() as HTTPMethod;
        let operation: Operation = (content as any)[m] as Operation;

        // Skip deprecated
        if (operation.deprecated) {
          console.warn("Skip depricated operation", operation.operationId);
          return result;
        }

        // Create request
        const operationSchema: OperationSchema = {
          name: createOperationName(operation, path, method),
          path: path,
          method: method,
          contentType: operation.consumes && operation.consumes[0] || this.spec.consumes && this.spec.consumes[0],
          response: emptySchema()
        };

        // Parse parameters
        operationSchema.response = this.parseResponse(operation.responses);
        operationSchema.pathParameter = this.parsePathParameter(operation.parameters || []);
        operationSchema.queryParameter = this.parseQueryParameter(operation.parameters || []);
        operationSchema.bodyParameter = this.parseBodyParameter(operation.parameters || []);
        operationSchema.formDataParameter = this.parseFormDataParameter(operation.parameters || []);

        return [...result, operationSchema];
      }, []);

      return [...result, ...operations];
    }, [] as OperationSchema[]);

    return {
      operations,
      models
    };
  }

  /**
   * Parse response schema
   * @param responses
   */
  private parseResponse(responses: { [key: string]: Response }): TSSchema {
    // Parse response
    if (responses) {
      const status = Object.keys(responses)
        .find((v) => {
          const status = parseInt(v, 10);
          return 200 <= status && status < 300;
        }) || 200;
      const response = responses[status];
      if (response && (response as any).$ref) {
        return mapTS(response);
      }
      if (response && response.schema) {
        return mapTS(response.schema);
      }
    }
    return emptySchema();
  }

  /**
   * Parse path parameters
   * @param parameters
   */
  private parsePathParameter(parameters: Parameter[]): TSSchema {
    // Parse path parameters
    return (parameters || []).filter(isPathParameter).reduce((res, v) => {
      res.properties[v.name] = mapTS(v, v.required);
      return res;
    }, emptySchema());
  }

  /**
   * Parse query parameters
   * @param parameters
   */
  private parseQueryParameter(parameters: Parameter[]): TSSchema {
    // Parse query parameters
    return (parameters || [])
      .filter(isQueryParameter)
      .reduce((res: TSSchema, v) => {
        res.properties[v.name] = mapTS(v, v.required);
        return res;
      }, emptySchema());
  }

  /**
   * Parse body parameters
   * @param parameters
   */
  private parseBodyParameter(parameters: Parameter[]): TSSchema {
    // Parse body parameters
    return (parameters || [])
      .filter(isBodyParameter)
      .map((v) => mapTS(v.schema!, v.required))[0];
  }

  /**
   * Parse form data parameters
   * @param parameters
   */
  private parseFormDataParameter(parameters: Parameter[]): TSSchema {
    // Parse form data parameters
    return (parameters || [])
      .filter(isFormDataParameter)
      .reduce((res: TSSchema, v) => {
        res.properties[v.name] = mapTS(v, v.required);
        return res;
      }, emptySchema());
  }

  /**
   * Generate files with requests
   * @param genCodeRequests
   */
  private genFiles(genCodeRequests: GenCodeRequest[]) {
    genCodeRequests.forEach(v => {
      console.log("Generate:", v.filepath);
      fs.writeFileSync(v.filepath, v.content, {
        encoding: "utf-8",
        flag: "w+"
      });
    });
  }

  /**
   * Create operations request
   * @param operations
   * @param template
   */
  private createOperations(
    operations: OperationSchema[],
    template: Handlebars.TemplateDelegate,
    directory: string
  ): GenCodeRequest[] {
    return operations.map(v => {
      return {
        filepath: path.resolve(directory, `${v.name}.ts`),
        content: template(v)
      };
    });
  }

  /**
   * Create operations request
   * @param operations
   * @param template
   */
  private createOperationBarrel(
    operations: OperationSchema[],
    template: Handlebars.TemplateDelegate,
    directory: string
  ): GenCodeRequest {
    return {
      filepath: path.resolve(directory, "index.ts"),
      content: template(operations)
    };
  }

  /**
   * Create operations request
   * @param operations
   * @param template
   */
  private createDefinitionBarrel(
    definitions: DefinitionSchema[],
    template: Handlebars.TemplateDelegate,
    directory: string
  ): GenCodeRequest {
    return {
      filepath: path.resolve(directory, "index.ts"),
      content: template(definitions)
    };
  }

  /**
   * Create definitions
   * @param definitions
   * @param template
   */
  private createDefinitions(
    definitions: DefinitionSchema[],
    template: Handlebars.TemplateDelegate,
    directory: string
  ) {
    return definitions
    .map(v => {
      return {
        filepath: path.resolve(directory, `${v.name}.ts`),
        content: template(v)
      };
    });
  }

  /**
   * Register embbeded partials
   */
  private registerPartial() {
    Handlebars.registerPartial("property", this.embedded("property"));
  }

  /**
   * Register handlebars helpers
   */
  private registerHelper() {
    Handlebars.registerHelper("normalizeCase", (text: string) => {
      return normalizeNaming(text, this.options.modelPropertyNaming);
    });
    Handlebars.registerHelper("ifEmpty", function(this: any, conditional: any, options: any) {
      if (typeof conditional === "object" && Object.keys(conditional).length === 0) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    Handlebars.registerHelper("definitionDir", () => {
      return this.definitionDir;
    });
    Handlebars.registerHelper("uniquePropertyRefTypes", (schema: TSSchema) => {
      const types = Object.values(schema.properties).filter(p => p.isRef).map(p => p.type);
      return Array.from(new Set(types));
    });
  }

  /**
   * Get embbeded template by name
   * @param name
   */
  private embedded(name: string) {
    return Handlebars.compile(
      fs.readFileSync(path.resolve(__dirname, `../templates/${name}.hbs`), "utf-8")
    );
  }

  /**
   * Get dist path
   */
  get dist(): string {
    return path.resolve(process.cwd(), this.options.dist);
  }
}
