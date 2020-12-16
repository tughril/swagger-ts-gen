import { Schema, BaseSchema } from "swagger-schema-official";
import { TSSchema } from "./types";
export default function mapTS(schema: Schema | BaseSchema, required?: boolean): TSSchema;
