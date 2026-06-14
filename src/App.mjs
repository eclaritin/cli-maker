// Node Packages //
import { default as process } from "process";

// Internal Modules //
import Scope from "./Scope.mjs";
import { throwIfNotA, DataType as dt, throwIfNotAType, isA } from "./Type.mjs";
import Arg from "./Arg.mjs";

// Default Class //
export default class App extends Scope {
  /// Properties ///
  /** @type {string} */
  version;

  // Callbacks //
  /** @type {((...any)=>void)?} default callback that is run when no actions or commands are specified */
  #mainCallback;
  /** @type {Arg[]} the argument scheme for the mainCallback function */
  mainArgs;
  /** @type {((any?)=>void)?} top-level callback that is run when an unhandled error is encountered */
  #errorCallback;

  // Flags //
  /** @type {boolean} */
  enableNoMainCallbackError;
  /** @type {boolean} */
  throwIfInvalidArgs;

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
    super(null, name);

    // assign fields
    this.mainArgs = [];
    this.version = "0.0.0";
    this.#mainCallback = null;
    this.#errorCallback = null;
  }

  /// Methods ///

  // Entrypoint

  /** Entrypoint for the application if no action args are specified @param {...any} args the arguments to be passed to the maincallback after validation */
  start(argv) {
    let args = [...argv.slice(2)];

    for (let i=0;i<args.length;i++){
      console.log(Arg.parseArgVal(args[i]));
    }
  }

  // Argument parsing

  /**
   * Parses raw string arguments and performs the written actions
   * @param  {...string} args
   */
  #parseArgs(...args) {
    // TODO
  }

  // REPL thing

  /**
   * If mainCallback isn't specified, this runs instead of it.
   * This starts a terminal-like loop where you can enter different scopes & perform actions & commands more easily.
   */
  #defaultLoop() {}

  /**
   * Runs the main callback with the specified arguments, if no main callback exists, runs the main loop
   * @param  {...any} args the args to pass to main
   * @returns {any?[]} leftover arguments after running main
   */
  #runMain(...args) {
    // if no main callback specified, just run the navigation loop
    if (!isA(this.#mainCallback, dt.Function)) {
      // run main loop if no main callback
      if (this.enableNoMainCallbackError)
        console.error(
          "No main callback registered to this app, defaulting to text-based navigation...",
        );

      this.#defaultLoop();
      return;
    }

    // validate args
    let validArgs = [];
    for (let i = 0; i < this.mainArgs.length; i++) {
      let spec = this.mainArgs[i];
      let expectedType = spec.type;
      let optional = spec.optional;
      let fallback = spec.default;

      let arg = args[0]; // because we're always removing an argument, the index is always zero here
      if (arg === undefined && optional) args = fallback;
      throwIfNotA(arg, expectedType);

      validArgs.push(arg);
      if (i < args.length) args.splice(0, 1);
    }

    // run callback
    this.#mainCallback(...validArgs);

    return [...args]; // return leftover args
  }

  // Setting callbacks

  /**
   * Sets the main callback
   * @param {(...any)=>void} callbackfn
   * @returns {App} this
   */
  main(callbackfn) {
    throwIfNotA(callbackfn, dt.Function);
    this.#mainCallback = callbackfn;
    return this;
  }

  /**
   * Sets the main error callback
   * @param {(any?)=>void} callbackfn
   * @returns {App} this
   */
  error(callbackfn) {
    throwIfNotA(callbackfn, dt.Function);
    this.#errorCallback = callbackfn;
    return this;
  }

  /**
   * Adds an ordinal argument to search for when running the main callback
   * @param {string} name the name of the arg (for the help message)
   * @param {any?} [defaultValue] if specified, this arg becomes optional
   * @returns {App} this app (for chaining method calls)
   */
  arg(name, type = dt.Any, defaultValue = undefined, comment = "") {
    // validate method params
    throwIfNotAType(type);
    throwIfNotA(name, dt.String);

    // create arg
    let myArg = new Arg(name, type, defaultValue);
    myArg.comment = comment;

    // add to args
    this.mainArgs.push(myArg);

    return this;
  }
}
