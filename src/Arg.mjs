// Internal Modules //
import { throwIfNotA, throwIfNotAType, DataType as dt } from "./Type.mjs";

// Default Class //
export default class Arg {
  /// Static ///

  /**
   * Returns a value of any type based on the string argument
   * @param {string} arg the raw string argument to parse
   * @returns {any?} parsed arg
   */
  static parseArg(arg) {
    throwIfNotA(arg,dt.String);

    
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
   *
   * @param {string} name
   * @param {dt} expectedType
   * @param {any?} [defaultValue]
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
