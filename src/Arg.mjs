// Internal Modules //
import { throwIfNotA, throwIfNotAType, DataType as dt } from "./Type.mjs";

// Default Class //
export default class Arg {
  /// Static ///

  static parseArg(arg){
    
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
