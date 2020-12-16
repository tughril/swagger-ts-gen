"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var process = require("process");
var commander = require("commander");
var path = require("path");
var generator_1 = require("../generator");
var pkg = require("../../package.json");
commander
    .version(pkg.version)
    .description("Generate typescript defintions from Swagger file")
    .command("generate <file>")
    .option("--model-property-naming <type>", "", /^(camelCase|original|snake_case)$/i, "camelCase")
    .option("--dist <path>", "dist directory")
    .option("--operation-dir <path>", "opreations directory", "operations")
    .option("--definition-dir <path>", "definitions directory", "models")
    .action(function (file, options) {
    try {
        var content = fs.readFileSync(file, "utf-8");
        var generator = new generator_1.Generator(JSON.parse(content), {
            dist: path.resolve(process.cwd(), options.dist || "./dist"),
            modelPropertyNaming: options.modelPropertyNaming,
            operationDir: options.operationDir,
            definitionDir: options.definitionDir
        });
        generator.generate();
    }
    catch (e) {
        console.error(e);
        process.exit(2);
    }
});
commander.parse(process.argv);
//# sourceMappingURL=cli.js.map