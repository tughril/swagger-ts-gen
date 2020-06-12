import * as fs from "fs";
import * as process from "process";
import * as commander from "commander";
import * as path from "path";
import { Generator } from "../generator";

const pkg = require("../../package.json");

commander
  .version(pkg.version)
  .description("Generate typescript defintions from Swagger file")
  .command("generate <file>")
  .option("--model-property-naming <type>", "", /^(camelCase|original|snake_case)$/i, "camelCase")
  .option("--dist <path>", "dist directory")
  .option("--operation-dir <path>", "opreations directory", "operations")
  .option("--definition-dir <path>", "definitions directory", "models")
  .action((file, options) => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const generator = new Generator(JSON.parse(content), {
        dist: path.resolve(process.cwd(), options.dist || "./dist"),
        modelPropertyNaming: options.modelPropertyNaming,
        operationDir: options.operationDir,
        definitionDir: options.definitionDir
      });
      generator.generate();
    } catch (e) {
      console.error(e);
      process.exit(2);
    }
  });

commander.parse(process.argv);
