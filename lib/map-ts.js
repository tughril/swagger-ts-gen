"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function mapTS(schema, required) {
    if (required === void 0) { required = false; }
    var tsSchema = {
        type: utils_1.mapType(schema.type, schema.format),
        isRequired: required,
        isArray: false,
        isRef: false,
        isNullable: utils_1.isNullable(schema),
        enum: [],
        properties: {}
    };
    if (schema.enum) {
        tsSchema.enum = schema.enum;
        return tsSchema;
    }
    if (utils_1.isSchema(schema)) {
        if (schema.$ref) {
            var name_1 = utils_1.getRefName(schema.$ref);
            tsSchema.isRef = true;
            tsSchema.type = name_1;
        }
        if (schema.properties) {
            tsSchema.properties = Object.keys(schema.properties).reduce(function (res, key) {
                var property = schema.properties[key];
                res[key] = mapTS(property, utils_1.isRequired(schema, key));
                return res;
            }, {});
        }
        return tsSchema;
    }
    if (schema.type === "array") {
        var parsed = mapTS(schema.items);
        tsSchema.type = parsed.type;
        tsSchema.isArray = true;
        tsSchema.isRef = parsed.isRef;
        tsSchema.properties = parsed.properties;
        return tsSchema;
    }
    return tsSchema;
}
exports.default = mapTS;
//# sourceMappingURL=map-ts.js.map