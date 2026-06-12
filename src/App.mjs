// Node Packages //
import { default as process } from "process";

// Internal Modules //
import Scope from "./Scope.mjs";
import { throwIfNotA, DataType as dt } from "./Type.mjs";

// Default Class //
export default class App extends Scope {
  /// Properties ///
  /** @type {string} */
  version;

  /** @type {((...any)=>void)?} default callback that is run when no actions or commands are specified */
  mainCallback;
  /** @type {((any?)=>void)?} top-level callback that is run when an unhandled error is encountered */
  errorCallback;

  /// Constructor ///

  /**
   * Creates an instance of App
   * @param {string} name Name of your app (must be file-system friendly)
   */
  constructor(name = "app") {
    // validate name
    throwIfNotA(name, dt.String);
    name = name.trim();
    if (name.endsWith(".js")) name = name.slice(0, -3).trimEnd();
    if (name.endsWith(".cjs") || name.endsWith(".mjs"))
      name = name.slice(0, -4).trimEnd();
    if (name.toLowerCase() === "index" || name.toLowerCase() === "main") {
      name = __dirname.trim();
    }

    // super
    super(Scope, name);

    // assign fields
    this.name = name;
    this.version = "0.0.0";
    this.mainCallback = null;
    this.errorCallback = null;
  }

  /// Getters & Setters ///

  /// Methods ///

  // Entrypoint

  /** General entrypoint for the application if no args are specified */
  start() {
    if (!isA(this.mainCallback, dt.Function)) this.defaultLoop();
    else this.mainCallback();
  }

  // Argument parsing

  /**
   * Parses raw string arguments and performs the written actions
   * @param  {...string} args
   */
  parseArgs(...args) {
    // TODO
  }

  // REPL thing

  /**
   * If mainCallback isn't specified, this runs instead of it.
   * This starts a terminal-like loop where you can enter different scopes & perform actions & commands more easily.
   */
  defaultLoop() {
    // TODO
  }

  // Setting callbacks

  /**
   * Sets the main callback
   * @param {(...any)=>void} callbackfn
   * @returns {App} this
   */
  main(callbackfn) {
    throwIfNotA(callbackfn, dt.Function);
    this.mainCallback = callbackfn;
    return this;
  }

  /**
   * Sets the main error callback
   * @param {(any?)=>void} callbackfn
   * @returns {App} this
   */
  error(callbackfn) {
    throwIfNotA(callbackfn, dt.Function);
    this.errorCallback = callbackfn;
    return this;
  }
}
