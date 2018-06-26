# swagger-ts-gen

A generator for typescript from Swagger

## Installation

```bash
npm install -D swagger-ts-gen
```

## Usage

```ts

import { TSCodeGenerator } from "swagger-ts-gen";

const content = fs.readFileSync("path to swagger", "utf-8");
const generator = new TSCodeGenerator(JSON.parse(content), {
  dist: path.resolve(process.cwd(), "dist")
});
generator.generate();

```
