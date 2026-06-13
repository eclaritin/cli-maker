// Internal Modules //
import Param from "./Param.mjs";
import Scope from "./Scope.mjs";

// Default Class //
export default class Setting extends Param {
  /// Properties ///

  /** @type {any?} */
  #value;
  /** @type {((newValue: any?)=>any?)?} */
  onChange;

  /// Constructor ///

  /**
   * Creates an instance of a setting parameter object
   * @param {Scope} parentScope the parent scope for this parameter
   * @param {string} name the name of this parameter
   * @param {any?} defaultValue the value to initialize this parameter with
   */
  constructor(parentScope, name = "param", defaultValue = null) {
    this.onChange = null;
    super(parentScope, name, defaultValue);
  }

  /// Getters & Setters ///

  get value() {
    return this.#value;
  }

  set value(val) {
    this.#value = val; // assign local value

    let newValIfNotUndef =
      typeof this.onChange === "function"
        ? this.onChange() || undefined
        : undefined; // calls onChange if it exists & ensures undefined as fallback
    if (newValIfNotUndef !== null) this.#value = newValIfNotUndef; // assign new value if onChange returned a value

    this.persist(); // write value to config
  }

  /// Methods ///
  /**
   * Saves this setting to the parent scope's config file
   * @returns {Setting} this setting
   */
  persist() {
    this.parent.persist(this);
  }
}
