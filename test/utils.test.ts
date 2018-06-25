import * as assert from "assert";
import { snakeToCamel, camelToSnake } from '../src/utils';

import {
  getRefName,
  isBodyParameter,
  isPathParameter,
  isQueryParameter,
  mapType,
  typeMap
} from "../src/utils";

describe("utils", () => {
  const parameter = (type: string) => {
    return { in: type, type: "string", name: "name" };
  };
  describe("#mapType", () => {
    it("Should map types", () => {
      Object.keys(typeMap).forEach(key => {
        assert(mapType(key) === typeMap[key]);
      });
    });

    it("Should return any by default", () => {
      assert(mapType("") === "any");
    });
  });

  describe("#getRefName", () => {
    it("Should return User", () => {
      assert(getRefName("#/definitions/User") === "User");
    });
  });

  describe("#isBodyParameter", () => {
    it("Should return true", () => {
      assert(isBodyParameter(parameter("body")) === true);
    });
    it("Should return false", () => {
      assert(isBodyParameter(parameter("path")) === false);
    });
  });

  describe("#isPathParameter", () => {
    it("Should return true", () => {
      assert(isPathParameter(parameter("path")) === true);
    });
    it("Should return false", () => {
      assert(isPathParameter(parameter("body")) === false);
    });
  });

  describe("#isQueryParameter", () => {
    it("Should return true", () => {
      assert(isQueryParameter(parameter("query")) === true);
    });
    it("Should return false", () => {
      assert(isQueryParameter(parameter("body")) === false);
    });
  });

  describe("#snakeToCamel", () => {
    it("Should return camelCase", () => {
      assert(snakeToCamel("camel_case") === "camelCase");
    });
  });

  describe("#camelToSnake", () => {
    it("Should return snake_case", () => {
      assert(camelToSnake("snakeCase") === "snake_case");
    });
  });

});
