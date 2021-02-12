# @tughril/swagger-ts-gen

A generator for typescript from Swagger

## Installation

```bash
npm install -D @tughril/swagger-ts-gen
```

## Usage

```ts

import { Generator } from "@tughril/swagger-ts-gen";

const content = fs.readFileSync("path to swagger", "utf-8");
const generator = new CodeGenerator(JSON.parse(content), {
  dist: path.resolve(process.cwd(), "dist")
});
generator.generate();

```
