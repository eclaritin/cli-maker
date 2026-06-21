// Internal Modules //
import { parse } from "path";
import {
  throwIfNotA,
  throwIfNotAType,
  DataType as dt,
  typeOf,
  throwIfInvalid,
} from "./Type.mjs";
import Command from "./Command.mjs";
import Param from "./Param.mjs";
import Scope from "./Scope.mjs";
import Setting from "./Setting.mjs";
import {
  default as Action,
  CommandAction,
  MainAction,
  ParamAction,
} from "./Actions.mjs";
import App from "./App.mjs";
import { genHelp } from "./Help.mjs";
import Flag from "./Flag.mjs";

// Internal Functions //

/**
 * Returns a value of any type based on the string argument (doesn't account for scope, params, commands! just the raw data)
 * @param {string} arg the raw string argument to parse
 * @returns {any?} parsed arg
 */
function parseArgVal(arg) {
  throwIfNotA(arg, dt.String);

  // test for keywords
  let keywordTest = arg.toLowerCase().trim();
  if (keywordTest === "null") return null;
  if (keywordTest === "undefined") return undefined;
  if (keywordTest === "true") return true;
  if (keywordTest === "false") return false;

  // number test
  if (!isNaN(arg)) {
    if (arg.includes("."))
      return parseFloat(arg); // float
    else return parseInt(arg); // int
  }

  // string is fallback
  return arg;
}

/** @param {string[]} args @returns {any[]} */
function parseArgsToRawValues(args) {
  let vals = [];
  for (let i = 0; i < args.length; i++) vals.push(parseArgVal(args[i]));
  return vals;
}

// Default Class //
export default class Arg {
  /// Static ///

  /**
   * Parses an array of arguments into a sequence of actions to take
   * @param {App} app the app to use as the default action
   * @param  {string[]} args (REMOVE THE FIRST TWO ELEMENTS IF USING `process.argv`!)
   * @param {Scope} [initScope=app] The initial current scope to search
   * @returns {{'actions':Action[], 'scope':Scope}}
   */
  static parseArgs(app, args, initScope = app) {
    throwIfNotA(app, App);
    throwIfNotA(args, Array);
    throwIfNotA(initScope, Scope);

    let valueArgs = parseArgsToRawValues(args);
    let actions = [];
    let actionStack = [new MainAction(app)];
    let currentScope = initScope;

    /** @returns {Action|undefined} */
    function getCurrentAction() {
      return actionStack[actionStack.length - 1];
    }

    function pushToAction(value) {
      let currAction = getCurrentAction();
      if (currAction instanceof CommandAction) currAction.addArg(value);
      else if (currAction instanceof ParamAction) currAction.value(value);
      else throw new Error(`Unrecognized action: ${currAction}`);
    }

    function pushAction() {
      let action = actionStack.pop();
      actions.push(action);
    }

    function delMainAction() {
      // search predicate
      const searchFunc = (val) => {
        return val instanceof MainAction; // searches for the MainAction
      };

      // search both arrays
      let stack_i = actionStack.findIndex(searchFunc);
      let acts_i = actions.findIndex(searchFunc);

      // delete from both
      if (stack_i > -1) actionStack.splice(stack_i, 1);
      if (acts_i > -1) actions.splice(acts_i, 1);
    }

    for (let i = 0; i < valueArgs.length; i++) {
      let arg = valueArgs[i];
      let currAction = getCurrentAction();

      switch (typeOf(arg)) {
        case dt.String:
          /** @type {string} */
          let key = arg;

          if (key.search("=") !== -1) {
            let value = parseArgVal(key.substring(key.search("=") + 1));
            valueArgs[i] = value;
            i--;
            // next iteration will set this value
          }

          // search for child with key in current scope
          let found = currentScope.get(key);

          if (
            currAction instanceof CommandAction &&
            currAction.argsLeft !== 0
          ) {
            // this is inside an argument chain
            if (found instanceof Flag) {
              let flagSetter = new ParamAction(found);
              flagSetter.value = !found.value;
              actions.push(flagSetter);
            } else if (found instanceof Param && !(found instanceof Command))
              actionStack.push(new ParamAction(found));
            else if (
              found instanceof Command &&
              currAction.numRequiredArgs <= currAction.args.length
            ) {
              pushAction();
              delMainAction();
              actionStack.push(new CommandAction(found));
            } else currAction.args.push(arg);
          } else if (currAction instanceof ParamAction) {
            // this is supposed to be a param value
            currAction.value(arg);
          } else {
            // this is not inside an argument chain
            if (found === null)
              throw new Error(`Could not resolve '${key}' in this scope`);

            if (found instanceof Param && !(found instanceof Command))
              actionStack.push(new ParamAction(found));
            else if (found instanceof Command) {
              if (found.disableMainProgram) delMainAction();
              actionStack.push(new CommandAction(found));
            } else if (found instanceof Scope) {
              currentScope = found;
              delMainAction();
            } else
              throw new Error(
                "Got unexpected value from Scope().get(): " + `${found}`,
              );
          }
          break;
        case dt.Number:
        case dt.Boolean:
        case dt.Null:
        case dt.Undefined:
          try {
            pushToAction(arg);
          } catch (err) {
            if (!(err instanceof Error)) throw err;
            if (!err.message.toLowerCase().startsWith("unrecognized action:"))
              throw err;
            throw new Error(
              `Unexpected extra argument '${arg}'! The program, '${app.name}' takes a maximum of ${app.mainArgs.length} argument(s)`,
            );
          }
          break;
        default:
          throw new TypeError(
            `Expected command-line arguments of type Number, Boolean, Null, Undefined, or String, but got argument '${arg}' of type '${typeOf(arg)}' instead!`,
          );
      }

      currAction = getCurrentAction();
      if (currAction) if (currAction.readyToPush) pushAction();
    }

    actions = actions.sort((a, b) => {
      return a instanceof MainAction ? 1 : -1;
    });

    return { actions: actions, scope: currentScope };
  }

  /// Instance ///

  /** @type {string} */
  name;
  /** @type {dt|object} */
  type;
  /** @type {any?} */
  default;
  /** @type {string} */
  comment;

  /** @type {boolean} */
  get optional() {
    return this.default !== undefined;
  }

  /**
   * Creates an object representing an argument in the help message of your program
   * @param {string} name the name of the argument
   * @param {dt} [expectedType=dt.Any] the expected type of this arg. any if unspecified
   * @param {any?} [defaultValue] if specified, this arg is marked as optional
   */
  constructor(name, expectedType = dt.Any, defaultValue = undefined) {
    // validate
    throwIfNotA(name, dt.String);
    throwIfNotAType(expectedType);

    // assign fields
    this.name = name;
    this.type = expectedType;
    this.default = defaultValue;
    this.comment = "";
  }

  // Methods //

  /** Displays this arg's help message */
  help() {
    console.log(genHelp(this));
  }

  /**
   * Sets the new comment for this object
   * @param {string} comment
   * @returns {Arg} this
   */
  describe(comment) {
    throwIfNotA(comment, dt.String);
    this.comment = comment;
    return this;
  }
}
