// Internal Modules //
import { parse } from "path";
import { throwIfNotA, throwIfNotAType, DataType as dt } from "./Type.mjs";

// Default Class //
export default class Arg {
  /// Static ///

  /**
   * Returns a value of any type based on the string argument (doesn't account for scope, params, commands! just the raw data)
   * @param {string} arg the raw string argument to parse
   * @returns {any?} parsed arg
   */
  static parseArgVal(arg) {
    throwIfNotA(arg, dt.String);

    // test for keywords
    let keywordTest = arg.toLowerCase().trim();
    if (keywordTest === "null") return null;
    if (keywordTest === "undefined") return undefined;

    // number test
    if (!isNaN(arg)) {
      if (arg.includes("."))
        return parseFloat(arg); // float
      else return parseInt(arg); // int
    }

    // string is fallback
    return arg;
  }

  /**
   * Parses an array of arguments to raw values
   * @param {string[]} args
   * @returns {any?[]} parsed args
   */
  static parseArgsToRawValues(args) {
    throwIfNotA(args, Array);

    let parsed = [];
    for (let i = 0; i < args.length; i++) {
      parsed.push(Arg.parseArgVal(args[i]));
    }
    return parsed;
  }

  /// Instance ///

  /** @type {string} */
  name;
  /** @type {dt|object} */
  type;
  /** @type {any?} */
  default;
  /** @type {string} */
  comment;

  /** @type {boolean} */
  get optional() {
    return this.default !== undefined;
  }

  /**
   * Creates an object representing an argument in the help message of your program
   * @param {string} name the name of the argument
   * @param {dt} [expectedType=dt.Any] the expected type of this arg. any if unspecified
   * @param {any?} [defaultValue] if specified, this arg is marked as optional
   */
  constructor(name, expectedType = dt.Any, defaultValue = undefined) {
    // validate
    throwIfNotA(name, dt.String);
    throwIfNotAType(expectedType);

    // assign fields
    this.name = name;
    this.type = expectedType;
    this.default = defaultValue;
    this.comment = "";
  }
}
