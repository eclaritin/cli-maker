// Internal Modules //
import Scope from "./Scope.mjs";
import { throwIfNotA, DataType as prim, typeOf } from "./Type.mjs";

// Default Class //
export default class Param {
  /// Properties ///
  /** @type {string} */
  name;
  /** @type {any?} */
  #value;
  /** @type {Scope} */
  #scopeRef;
  /** @type {string} */
  comment;
  /** @type {prim} */
  type;
  /** @type {((any?)=>void)?} Called when the param is changed. First parameter is the new value. */
  onChange;

  /// Constructor ///

  /**
   * Creates an instance of a parameter object
   * @param {Scope} parentScope the parent scope for this parameter
   * @param {string} name the name of this parameter
   * @param {any?} defaultValue the value to initialize this parameter with
   */
  constructor(parentScope, name = "param", defaultValue = undefined) {
    // type checking
    throwIfNotA(parentScope, Scope);
    throwIfNotA(name, prim.String);

    // assign fields
    this.#scopeRef = parentScope;
    this.name = name;
    this.#value = defaultValue;
    this.comment = "";
    this.type = defaultValue === undefined ? prim.Any : typeOf(defaultValue);
    this.onChange = null;
  }

  /// Getters & Setters ///

  /** @type {Scope} */
  get parent() {
    return this.#scopeRef;
  }

  /** @type {string} */
  get helpMessage() {
    // TODO
  }

  /** @type {any?} */
  get value() {
    return this._get();
  }

  set value(val) {
    this._set(val);
  }

  /// Methods ///

  /** Underlying method that changes this value. Separated from the setter so I can use it in subclasses. */
  _set(val) {
    throwIfNotA(val, this.type);
    this.#value = val;
    if (typeof this.onChange === "function") this.onChange(val); // calls onChange if it exists
  }

  /** Underlying method that reads this value. Separated from the getter so I can use it in subclasses. */
  _get() {
    return this.#value;
  }
}
