// Internal Modules //
import Scope from "./Scope.mjs";
import { throwIfNotA, DataType as prim } from "./Type.mjs";

// Default Class //
export default class Param {
  /// Properties ///
  /** @type {string} */
  name;
  /** @type {amy?} */
  value;
  /** @type {Scope} */
  #scopeRef;
  /** @type {string} */
  comment;

  /// Constructor ///

  /**
   * Creates an instance of a parameter object
   * @param {Scope} parentScope the parent scope for this parameter
   * @param {string} name the name of this parameter
   * @param {any?} defaultValue the value to initialize this parameter with
   */
  constructor(parentScope, name = "param", defaultValue = null) {
    // type checking
    throwIfNotA(parentScope, Scope);
    throwIfNotA(name, prim.String);

    // assign fields
    this.#scopeRef = parentScope;
    this.name = name;
    this.value = defaultValue;
    this.comment = "";
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
}
