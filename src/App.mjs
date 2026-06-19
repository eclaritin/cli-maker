// Node Packages //
import { default as process } from "process";
import { default as readline } from "readline";

// Internal Modules //
import Scope from "./Scope.mjs";
import {
  throwIfNotA,
  DataType as dt,
  throwIfNotAType,
  isA,
  typeOf,
} from "./Type.mjs";
import Arg from "./Arg.mjs";

// Constants //
const DEBUG_MODE = true; // for debugging purposes, disable before release

// Default Class //
export default class App extends Scope {
  /// Properties ///
  /** @type {string} */
  version;
  /** @type {Scope} */
  #currentScope;

  // Callbacks //
  /** @type {((...any)=>void)?} default callback that is run when no actions or commands are specified */
  mainCallback;
  /** @type {Arg[]} the argument scheme for the mainCallback function */
  mainArgs;
  /** @type {((any?)=>void)?} top-level callback that is run when an unhandled error is encountered */
  #errorCallback;

  // Flags //
  /** @type {boolean} Exit early & log error if main args are invalid */
  throwIfInvalidArgs;
  /** @type {boolean} If no mainCallback is specified or no args are passed, enter a mode where you navigate the various scopes of the CLI app */
  enableDefaultLoop;

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
    this.mainCallback = null;
    this.#errorCallback = null;
    this.#currentScope = this;
  }

  /// Methods ///

  // Entrypoint

  /**
   * The main entrypoint for the CLI app.
   * Call this last, after building your app with the other methods of this object.
   * @param {string[]} [argv] If unspecified, defaults to the value of `process.argv`
   * @returns {any} the value returned by the final command or main callback
   */
  start(argv = process.argv) {
    if (argv.length === 2) return this.#defaultLoop();

    let actions = this.#parseArgs(argv);
    this.#runActions(actions);
  }

  // Argument parsing

  /**
   * Parses raw string arguments and performs the written actions
   * @param  {string[]} argv
   * @returns {Action[]} the sequence of actions to perform
   */
  #parseArgs(argv = process.argv) {
    let stringArgs = argv[0] === process.argv[0] ? argv.slice(2) : argv; // if process.argv supplied, get rid of first two args (they are useless)
    return Arg.parseArgs(this, stringArgs);
  }

  // REPL thing

  /**
   * If mainCallback isn't specified, this runs instead of it.
   * This starts a terminal-like loop where you can enter different scopes & perform actions & commands more easily.
   * @param {Scope} [initScope] The initial scope to start the loop in. (Set to App scope by default).
   */
  #defaultLoop(initScope = this) {
    if (!this.enableDefaultLoop) return;

    let userInput = "";

    let rli = readline.createInterface(process.stdin, process.stdout);
    rli.on("line", (line) => {
      userInput = line;
    });

    let exitFlag = false;
    this.#currentScope = initScope;
    while (!exitFlag) {
      if (DEBUG_MODE) exitFlag = true; // test only one iteration
      try {
        rli.write(``);
        rli.line();

        // filter out empty values from args
        let args = userInput
          .trim()
          .split(" ")
          .filter((elem) => {
            return elem.trim() !== "";
          });

        let actions = Arg.parseArgs(this, args, this.#currentScope);

        this.#runActions(actions);
      } catch (err) {
        console.error(err.message);
      }
    }
  }

  /**
   *
   * @param {Action[]} actionArr
   * @returns {Scope?} the current scope when leaving the loop
   */
  #runActions(actionArr) {
    for (let i = 0; i < actionArr.length; i++) {
      let action = actionArr[i];
      let type = action.type;
      action.run();
    }
  }

  /**
   * Runs the main callback with the specified arguments, if no main callback exists, runs the main loop
   * @param  {...any} args the args to pass to main
   * @returns {any?[]} leftover arguments after running main
   */
  #runMain(...args) {
    // if no main callback specified, just run the navigation loop
    if (!isA(this.mainCallback, dt.Function)) {
      // run main loop if no main callback
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
    this.mainCallback(...validArgs);

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
