import TSCodeGenerator from '../src/TSCodeGenerator';
import * as assert from 'assert';

const spec = require("../examples/petstore.json");

describe("utils", () => {

    const generator = new TSCodeGenerator(
        spec,
        {
            dist: "."
        }
    )

    const parsed = generator.parseSpec();

    describe("#parseSpec", () => {

        it("should get one or more definitions", () => {
            assert(parsed.definitions.length > 0)
        });

        it("should get Pet as a defintion", () => {
            const pet = parsed.definitions.filter(v => v.name === "Pet")[0]
            assert.deepEqual(pet.schema, {
                type: "any",
                isRef: false,
                isRequired: false,
                isArray: false,
                enum: [],
                properties: {
                    id: {
                        type: "number",
                        isRef: false,
                        isRequired: true,
                        isArray: false,
                        enum: [],
                        properties: {},
                    },
                    name: {
                        type: "string",
                        isRef: false,
                        isRequired: true,
                        isArray: false,
                        enum: [],
                        properties: {}
                    },
                    tag: {
                        type: "string",
                        isRef: false,
                        isRequired: false,
                        isArray: false,
                        enum: [],
                        properties: {}
                    }
                }
            });
        });

        it("should get one or more operations", () => {
            assert(parsed.operations.length > 0)
        })

        it("should get ListPets as a operation", () => {
            const listPets = parsed.operations.filter( v => v.name === "ListPets")[0];
            assert(listPets.method === "GET");
            assert(listPets.path === "/pets");
            assert(listPets!.queryParameter!.properties["limit"]!.type === "number");
        })
    });

});
