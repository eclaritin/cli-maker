// Internal Modules //
import Param from "./Param.mjs";
import Scope from "./Scope.mjs";
import { DataType as dt, throwIfNotA } from "./Type.mjs";

// Default Class //
export default class Flag extends Param {
  /**
   * @param {Scope} parentScope
   * @param {string} name
   * @param {boolean} defaultValue
   */
  constructor(parentScope, name = "flag", defaultValue = false) {
    throwIfNotA(defaultValue, dt.Boolean);
    super(parentScope, name);
    this.value = defaultValue;
  }

  /** @type {dt} */
  get type() {
    return dt.Boolean;
  }
}
