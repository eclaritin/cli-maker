// Internal Modules //
import Param from "./Param.mjs";
import {
  throwIfNotA,
  DataType as dt,
  isA,
  throwIfInvalid,
  throwIfNotAType,
} from "./Type.mjs";
import Arg from "./Arg.mjs";

// Default Class //
export default class Command extends Param {
  //// Static ////

  /**
   * displays an error
   * @param {string} name the name of the command
   */
  static NotImplemented(name) {
    console.error(
      `Sorry, but the command '${name}' has not been implemented yet.`,
    );
  }

  /**
   * displays an error
   * @param {string} name the name of the command
   */
  static NotFound(name) {
    console.error(
      `Sorry, but the command '${name}' was not found in this scope.`,
    );
  }

  //// Instance ////

  /// Properties ///
  // Command //
  /** @type {Arg[]} */
  args;

  // Flags //
  /** @type {boolean} */
  enableNoMainCallbackError;
  /** @type {boolean} */
  throwIfInvalidArgs;
  /** @type {boolean} */
  showInHelp;

  /// Constructor ///

  /**
   * Creates an instance of a command object
   * @param {Scope} parentScope the parent scope for this parameter
   * @param {string} name the name of this parameter
   * @param {(...any)=>void} [callbackfn] the value to initialize this parameter with
   */
  constructor(
    parentScope,
    name = "command",
    callbackfn = () => {
      Command.NotImplemented(name);
    },
  ) {
    throwIfNotA(callbackfn, dt.Function); // ensure callback param is of type function
    super(parentScope, name, callbackfn); // call default constructor with validated params
    this.args = [];
    this.showInHelp = true;
  }

  /// Methods ///

  /**
   * Runs the callback with the specified arguments
   * @param  {...any} args the arguments to supply as input
   * @returns {any[]} any leftover args after validating types via the command's args array
   */
  exec(...args) {
    let validArgs = [];
    for (let i = 0; i < this.args.length; i++) {
      let spec = this.args[i];
      let expectedType = spec.type;
      let optional = spec.optional;
      let fallback = spec.default;

      let arg = args[0]; // because we're always removing an argument, the index is always zero here
      if (arg === undefined && optional) args = fallback;
      throwIfNotA(arg, expectedType);

      validArgs.push(arg);
      if (i < args.length) args.splice(0, 1);
    }

    if (!isA(this.value, dt.Function)) return Command.NotImplemented(this.name); // if no callback specified, run NotImplemented instead
    this.value(...validArgs); // pass processed args into it

    return [...args]; // return leftover args
  }

  /**
   * Creates a new command in this scope with a different name referencing this one
   * @param {string} otherName
   * @returns {Command} this command (not the alias command)
   */
  alias(otherName) {
    const self = this;
    const refCmd = this.parent.command(otherName, (...passToSelf) => {
      return self.exec(...passToSelf);
    });
    refCmd.args = this.args;
    refCmd.showInHelp = false;
    return this;
  }

  /**
   * Adds an ordinal argument to search for when running this command
   * @param {string} name the name of the arg (for the help message)
   * @param {any?} [defaultValue] if specified, this arg becomes optional
   * @returns {Command} this command object (for chaining method calls)
   */
  arg(name, type = dt.Any, defaultValue = undefined, comment = "") {
    // validate method params
    throwIfNotAType(type);
    throwIfNotA(name, dt.String);

    // create arg
    let myArg = new Arg(name, type, defaultValue);
    myArg.comment = comment;

    // add to args
    this.args.push(myArg);

    return this;
  }

  /**
   * Resets the callback to another function
   * @param {(...any)=>void} callbackfn the function to be called when the command is run & supplied with the correct args
   */
  callback(callbackfn) {
    throwIfNotA(callbackfn, dt.Function);

    this.value = callbackfn;
  }
}
