// Base Action Class //

import Arg from "./Arg.mjs";
import { dt, throwIfNotA } from "./Type.mjs";
import App from "./App.mjs";
import Command from "./Command.mjs";

/**
 * The base Action class. Not meant to be used directly,
 * use the more specific Action classes exported by this module instead!
 */
export default class Action {
  /** @readonly @enum {number} */
  static Type = Object.freeze({
    Param: 0,
    Command: 1,
    Main: 2,
  });

  /** @type {Action.Type} */
  type;
  /** @type {App|Param|Command|Scope} */
  ref;
  /** @type {boolean} */
  alsoRunMainCallback;

  /** @type {boolean} */
  get readyToPush() {
    return true;
  }

  /** @param {Action.Type} type @param {App|Param|Command} ref */
  constructor(type, ref) {
    this.type = type;
    this.ref = ref;
    this.alsoRunMainCallback = false;
  }

  run() {
    throw new Error("Please cast this object to a more specific Action class!");
  }
}

// Specific Action Classes //

/** Action that calls a command */
export class CommandAction extends Action {
  /** @type {Command} */
  ref;
  /** @type {any[]} */
  args;

  /** @type {number} */
  get maxArgs() {
    return this.ref.args.length;
  }

  /** @type {number} */
  get numRequiredArgs() {
    let count = 0;
    while (count < this.maxArgs) {
      let expectedArg = this.ref.args[count];
      if (expectedArg.optional) break;
      count++;
    }
    return count;
  }

  /** @type {number} */
  get argsLeft() {
    return this.maxArgs - this.args.length;
  }

  /** @type {boolean} */
  get readyToPush() {
    return this.argsLeft === 0;
  }

  /** @param {Command} ref Reference to the command this action is referencing */
  constructor(ref) {
    throwIfNotA(ref, dt.Object);
    super(Action.Type.Command, ref);

    this.ref = ref;
    this.type = Action.Type.Command;
    this.args = [];
  }

  /**
   * Validates the argument & then adds it to `this.args`
   * @param {any?} arg the value to add to args
   * @returns {Action} this (for method chaining)
   */
  addArg(arg) {
    if (this.argsLeft === 0)
      throw new Error(`Unexpected extra argument: ${arg}`);

    let i = this.args.length; // index the new argument will be placed at, also the index to check for the expected type
    let expectedType = this.ref.args[i].type; // the expected type of this arg
    throwIfNotA(arg, expectedType); // validate arg

    this.args.push(arg);
  }

  /**
   * Invokes the command with the specified arguments in `this.args`
   * @returns {any?} the value obtained from the callback by running `this.ref.exec`
   */
  run() {
    try {
      return this.ref.exec(...this.args);
    } catch (err) {
      return console.error(`${err.name}: ${err.message}`);
    }
  }
}

/** Action that sets the value of a param or setting */
export class ParamAction extends Action {
  /** @type {Param} */
  ref;
  /** @type {any?} the new value to set this param's value to */
  #value;

  /** @param {Param} ref */
  constructor(ref) {
    throwIfNotA(ref, Param);
    super(Action.Type.Param, ref);

    this.#value = undefined;
    if (!(ref instanceof Setting)) this.alsoRunMainCallback = true;
  }

  /** @param {any?} value the value to be assigned to the Param's value on run (assuming it's a valid type) */
  value(value) {
    throwIfNotA(value, this.ref.type);
    this.#value = value;
  }
}

/** Action that calls the main callback of the app */
export class MainAction extends CommandAction {
  /** @param {App} app */
  constructor(app) {
    throwIfNotA(app, App);
    super({ args: app.mainArgs, exec: app.mainCallback, name: app.name });

    this.type = Action.Type.Main;
  }
}
