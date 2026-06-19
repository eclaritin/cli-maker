// Internal Modules //
import Param from "./Param.mjs";
import Scope from "./Scope.mjs";

// Default Class //
export default class Setting extends Param {
  /// Constructor ///

  /**
   * Creates an instance of a setting parameter object
   * @param {Scope} parentScope the parent scope for this parameter
   * @param {string} name the name of this parameter
   * @param {any?} defaultValue the value to initialize this parameter with
   */
  constructor(parentScope, name = "setting", defaultValue = undefined) {
    super(parentScope, name, defaultValue);
    this.persist();
  }

  /// Methods ///

  _set(val) {
    super._set(val);
    this.persist();
  }

  /**
   * Saves this setting to the parent scope's config file
   * @returns {Setting} this setting
   */
  persist() {
    this.parent.persist(this);
  }
}
