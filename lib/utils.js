"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseName = exports.enumerate = exports.camelToSnake = exports.snakeToCamel = exports.toUpperCamelCase = exports.normalizeNaming = exports.emptySchema = exports.createOperationName = exports.normalizePath = exports.isSchema = exports.isRequired = exports.isQueryParameter = exports.isPathParameter = exports.isBodyParameter = exports.isFormDataParameter = exports.isNullable = exports.getRefName = exports.mapType = exports.typeMap = void 0;
exports.typeMap = {
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
    binary: "string",
    ByteArray: "string",
    UUID: "string",
    File: "any",
    Error: "Error"
};
function mapType(type, format) {
    if (!type) {
        return "any";
    }
    if (type === "string" && (format === "int64" || format === "uint64")) {
        return "number";
    }
    return exports.typeMap[type || ""] || "any";
}
exports.mapType = mapType;
function getRefName(ref) {
    var segments = ref.split("/");
    var type = segments[1];
    if (type === "responses") {
        return responseName(segments[segments.length - 1]);
    }
    return segments[segments.length - 1];
}
exports.getRefName = getRefName;
function isNullable(schema) {
    return schema["x-nullable"] === true;
}
exports.isNullable = isNullable;
function isFormDataParameter(parameter) {
    return parameter.in === "formData";
}
exports.isFormDataParameter = isFormDataParameter;
function isBodyParameter(parameter) {
    return parameter.in === "body";
}
exports.isBodyParameter = isBodyParameter;
function isPathParameter(parameter) {
    return parameter.in === "path";
}
exports.isPathParameter = isPathParameter;
function isQueryParameter(parameter) {
    return parameter.in === "query";
}
exports.isQueryParameter = isQueryParameter;
function isRequired(schema, key) {
    return (schema.required || []).indexOf(key) !== -1;
}
exports.isRequired = isRequired;
function isSchema(schemaOrBaseSchema) {
    var schema = schemaOrBaseSchema;
    return (schema.$ref !== undefined ||
        schema.allOf !== undefined ||
        schema.additionalProperties !== undefined ||
        schema.properties !== undefined ||
        schema.discriminator !== undefined ||
        schema.readOnly !== undefined ||
        schema.xml !== undefined ||
        schema.externalDocs !== undefined ||
        schema.example !== undefined ||
        schema.required !== undefined);
}
exports.isSchema = isSchema;
function normalizePath(path) {
    if (path.charAt(0) === "/") {
        return path;
    }
    return "/" + path.slice(1);
}
exports.normalizePath = normalizePath;
function createOperationName(operation, path, method) {
    if (operation.operationId) {
        return toUpperCamelCase(operation.operationId.replace(/\./g, ""));
    }
    return toUpperCamelCase("" + method.toLowerCase() + normalizePath(path).replace(/\//g, "_").replace(/\{|\}/g, ""));
}
exports.createOperationName = createOperationName;
function emptySchema() {
    return {
        type: "void",
        isRequired: false,
        isRef: false,
        isNullable: false,
        isArray: false,
        properties: {},
        enum: []
    };
}
exports.emptySchema = emptySchema;
function normalizeNaming(str, naming) {
    switch (naming) {
        case "camelCase":
            return snakeToCamel(str);
        case "snake_case":
            return camelToSnake(str);
        case "original":
            return str;
    }
}
exports.normalizeNaming = normalizeNaming;
function toUpperCamelCase(str) {
    var camelCase = snakeToCamel(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
exports.toUpperCamelCase = toUpperCamelCase;
function snakeToCamel(str) {
    return str.replace(/_+(\w){1}|-+(\w){1}/g, function (_, group1, group2) {
        var letter = group1 || group2;
        return letter.toUpperCase();
    });
}
exports.snakeToCamel = snakeToCamel;
function camelToSnake(str) {
    return str
        .replace(/([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g, function (_, group1, group2) {
        return group1 + (group2 && "_" + group2);
    })
        .toLowerCase();
}
exports.camelToSnake = camelToSnake;
function enumerate(obj) {
    return Object.keys(obj).map(function (key) { return ({
        key: key,
        value: obj[key]
    }); });
}
exports.enumerate = enumerate;
function responseName(name) {
    return name + "Response";
}
exports.responseName = responseName;
//# sourceMappingURL=utils.js.map