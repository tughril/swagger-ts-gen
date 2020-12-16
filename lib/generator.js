"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
var fs = require("fs");
var path = require("path");
var handlebars_1 = require("handlebars");
var utils_1 = require("./utils");
var map_ts_1 = require("./map-ts");
var utils_2 = require("./utils");
var Generator = (function () {
    function Generator(spec, options) {
        this.spec = spec;
        this.options = options;
        this.operationsDir = options.operationDir;
        this.definitionDir = options.definitionDir;
    }
    Generator.prototype.generate = function () {
        if (this.spec.swagger !== "2.0") {
            throw new Error("Only 2.0 is supported. Your version: " + this.spec.swagger);
        }
        var data = this.parseSpec();
        var templates = this.options.templates || {};
        var definitionTmpl = templates.definition ||
            fs.readFileSync(path.resolve(__dirname, "../templates/definition.hbs"), "utf-8");
        var operationTmpl = templates.operation ||
            fs.readFileSync(path.resolve(__dirname, "../templates/operation.hbs"), "utf-8");
        var barrelTmpl = fs.readFileSync(path.resolve(__dirname, "../templates/barrel.hbs"), "utf-8");
        this.registerPartial();
        this.registerHelper();
        var operationDir = path.resolve(this.dist, this.operationsDir);
        var definitionDir = path.resolve(this.dist, this.definitionDir);
        if (!fs.existsSync(this.dist)) {
            fs.mkdirSync(this.dist);
        }
        if (data.operations.length > 0 && !fs.existsSync(operationDir)) {
            fs.mkdirSync(operationDir);
        }
        if (data.models.length > 0 && !fs.existsSync(definitionDir)) {
            fs.mkdirSync(definitionDir);
        }
        this.genFiles(__spreadArrays(this.createDefinitions(data.models, handlebars_1.default.compile(definitionTmpl), definitionDir), [
            this.createDefinitionBarrel(data.models, handlebars_1.default.compile(barrelTmpl), definitionDir)
        ], this.createOperations(data.operations, handlebars_1.default.compile(operationTmpl), operationDir), [
            this.createOperationBarrel(data.operations, handlebars_1.default.compile(barrelTmpl), operationDir),
        ]));
    };
    Generator.prototype.parseSpec = function () {
        var _this = this;
        var models = __spreadArrays(utils_2.enumerate(this.spec.definitions || {})
            .map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({
                name: key,
                schema: map_ts_1.default(value),
            });
        }), utils_2.enumerate(this.spec.responses || {})
            .map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({
                name: utils_2.responseName(key),
                schema: map_ts_1.default(value.schema),
            });
        }));
        var operations = utils_2.enumerate(this.spec.paths).reduce(function (result, _a) {
            var key = _a.key, value = _a.value;
            var content = value;
            var path = key;
            delete content.parameters;
            var operations = Object.keys(content).reduce(function (result, m) {
                var method = m.toUpperCase();
                var operation = content[m];
                if (operation.deprecated) {
                    console.warn("Skip depricated operation", operation.operationId);
                    return result;
                }
                var operationSchema = {
                    name: utils_1.createOperationName(operation, path, method),
                    path: path,
                    method: method,
                    contentType: operation.consumes && operation.consumes[0] || _this.spec.consumes && _this.spec.consumes[0],
                    response: utils_1.emptySchema()
                };
                operationSchema.response = _this.parseResponse(operation.responses);
                operationSchema.pathParameter = _this.parsePathParameter(operation.parameters || []);
                operationSchema.queryParameter = _this.parseQueryParameter(operation.parameters || []);
                operationSchema.bodyParameter = _this.parseBodyParameter(operation.parameters || []);
                operationSchema.formDataParameter = _this.parseFormDataParameter(operation.parameters || []);
                return __spreadArrays(result, [operationSchema]);
            }, []);
            return __spreadArrays(result, operations);
        }, []);
        return {
            operations: operations,
            models: models
        };
    };
    Generator.prototype.parseResponse = function (responses) {
        if (responses) {
            var status_1 = Object.keys(responses)
                .find(function (v) {
                var status = parseInt(v, 10);
                return 200 <= status && status < 300;
            }) || 200;
            var response = responses[status_1];
            if (response && response.$ref) {
                return map_ts_1.default(response);
            }
            if (response && response.schema) {
                return map_ts_1.default(response.schema);
            }
        }
        return utils_1.emptySchema();
    };
    Generator.prototype.parsePathParameter = function (parameters) {
        return (parameters || []).filter(utils_1.isPathParameter).reduce(function (res, v) {
            res.properties[v.name] = map_ts_1.default(v, v.required);
            return res;
        }, utils_1.emptySchema());
    };
    Generator.prototype.parseQueryParameter = function (parameters) {
        return (parameters || [])
            .filter(utils_1.isQueryParameter)
            .reduce(function (res, v) {
            res.properties[v.name] = map_ts_1.default(v, v.required);
            return res;
        }, utils_1.emptySchema());
    };
    Generator.prototype.parseBodyParameter = function (parameters) {
        return (parameters || [])
            .filter(utils_1.isBodyParameter)
            .map(function (v) { return map_ts_1.default(v.schema, v.required); })[0];
    };
    Generator.prototype.parseFormDataParameter = function (parameters) {
        return (parameters || [])
            .filter(utils_1.isFormDataParameter)
            .reduce(function (res, v) {
            res.properties[v.name] = map_ts_1.default(v, v.required);
            return res;
        }, utils_1.emptySchema());
    };
    Generator.prototype.genFiles = function (genCodeRequests) {
        genCodeRequests.forEach(function (v) {
            console.log("Generate:", v.filepath);
            fs.writeFileSync(v.filepath, v.content, {
                encoding: "utf-8",
                flag: "w+"
            });
        });
    };
    Generator.prototype.createOperations = function (operations, template, directory) {
        return operations.map(function (v) {
            return {
                filepath: path.resolve(directory, v.name + ".ts"),
                content: template(v)
            };
        });
    };
    Generator.prototype.createOperationBarrel = function (operations, template, directory) {
        return {
            filepath: path.resolve(directory, "index.ts"),
            content: template(operations)
        };
    };
    Generator.prototype.createDefinitionBarrel = function (definitions, template, directory) {
        return {
            filepath: path.resolve(directory, "index.ts"),
            content: template(definitions)
        };
    };
    Generator.prototype.createDefinitions = function (definitions, template, directory) {
        return definitions
            .map(function (v) {
            return {
                filepath: path.resolve(directory, v.name + ".ts"),
                content: template(v)
            };
        });
    };
    Generator.prototype.registerPartial = function () {
        handlebars_1.default.registerPartial("property", this.embedded("property"));
    };
    Generator.prototype.registerHelper = function () {
        var _this = this;
        handlebars_1.default.registerHelper("normalizeCase", function (text) {
            return utils_1.normalizeNaming(text, _this.options.modelPropertyNaming);
        });
        handlebars_1.default.registerHelper("ifEmpty", function (conditional, options) {
            if (typeof conditional === "object" && Object.keys(conditional).length === 0) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        handlebars_1.default.registerHelper("definitionDir", function () {
            return _this.definitionDir;
        });
        handlebars_1.default.registerHelper("uniquePropertyRefTypes", function (schema) {
            var types = Object.values(schema.properties).filter(function (p) { return p.isRef; }).map(function (p) { return p.type; });
            return Array.from(new Set(types));
        });
    };
    Generator.prototype.embedded = function (name) {
        return handlebars_1.default.compile(fs.readFileSync(path.resolve(__dirname, "../templates/" + name + ".hbs"), "utf-8"));
    };
    Object.defineProperty(Generator.prototype, "dist", {
        get: function () {
            return path.resolve(process.cwd(), this.options.dist);
        },
        enumerable: false,
        configurable: true
    });
    return Generator;
}());
exports.Generator = Generator;
//# sourceMappingURL=generator.js.map