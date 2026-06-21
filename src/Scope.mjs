// Constants //
const configDir = "./config/";

// Node Packages //
import { default as fs } from "fs";
import { default as path } from "path";

// Internal Modules //
import Param from "./Param.mjs";
import Setting from "./Setting.mjs";
import Command from "./Command.mjs";
import { DataType as dt, isA, throwIfNotA } from "./Type.mjs";
import { genHelp } from "./Help.mjs";

// Misc Utility Functions //

/**
 * @template T type of array
 * @param {T[]} arr
 * @param {(T,number)=>void} callbackfn
 */
function forEachSync(arr, callbackfn) {
  throwIfNotA(arr, Array);
  throwIfNotA(callbackfn, dt.Function);

  let map = [];
  for (let i = 0; i < arr.length; i++) map.push(callbackfn(arr[i], i));
  return map;
}

// Default Class //
export default class Scope {
  /// Properties ///

  /** @type {string} */
  name;
  /** @type {Scope?} */
  #scopeRef;
  /** @type {Command[]} */
  commands;
  /** @type {Param[]} */
  params;
  /** @type {Scope[]} */
  scopes;
  /** @type {string} */
  comment;
  /** @type {boolean} */
  showInHelp;

  /// Constructor ///

  /**
   * Creates an instance of a Scope object
   * @param {Scope?} [parentScope]
   * @param {string} [name="scope"]
   */
  constructor(parentScope = null, name = "scope") {
    this.#scopeRef = parentScope instanceof Scope ? parentScope : null;
    this.name = name;
    this.comment = "";
    this.commands = [];
    this.params = [];
    this.scopes = [];
    this.showInHelp = true;

    // Define Default Commands //
    /** @type {Command} */
    const helpCmd = this.command("help")
      .alias("--help")
      .alias("-h")
      .alias("/h")
      .alias("/?")
      .alias("-?")
      .alias("-help")
      .alias("/help")
      .describe("Displays this message");

    /** @type {Command} */
    const exitCmd = this.command("exit")
      .alias("quit")
      .describe("Exits the program");

    // Default Commands Behavior //
    let self = this;

    helpCmd.callback(() => {
      self.help();
    });

    exitCmd.callback(() => {
      self.app.exitFlag = true;
    });
  }

  /// Getters & Setters ///

  /** @type {Scope?} */
  get parent() {
    return this.#scopeRef;
  }

  /** @type {App} (DO NOT IMPORT THIS FOR REAL) */
  get app() {
    let traverse = this;
    let last = undefined;
    while (traverse instanceof Scope) {
      last = traverse;
      traverse = traverse.parent;
    }
    return last; // the last parent should always be the app
  }

  /** @type {string} */
  get helpMessage() {
    return genHelp(this);
  }

  /** @type {string} */
  get #configPath() {
    let filename = this.absolutePath.replaceAll(" ", ".") + ".json"; // creates a filename separated by periods and specify its a json file
    return path.join(configDir, filename); // append filename to the config directory path to be placed there
  }

  /** @type {string} A string by the format of `"appName parentScopeName thisScopeName"` */
  get absolutePath() {
    // init vars
    let collected_names = [];
    let traverse = this;

    // traverse the hierarchy upwards, recording each name
    while (isA(traverse, Scope)) {
      collected_names.push(traverse.name);
      traverse = traverse.parent;
    }
    collected_names.reverse();
    return collected_names.join(" "); // creates a string with spaces as delimiters
  }

  /** @readonly @type {{[key: string]: any?}} */
  get config() {
    return Object.freeze(this.#readConfig());
  }

  /// Methods ///

  // Help message //

  /** Displays the help message for this scope */
  help() {
    console.log(this.helpMessage);
  }

  /**
   * Sets the new comment for this object
   * @param {string} comment
   * @returns {Scope} this
   */
  describe(comment) {
    throwIfNotA(comment, dt.String);
    this.comment = comment;
    return this;
  }

  // Config //

  /** Creates the config file & its parent directory if not found */
  #ensureConfigFileExists() {
    let path = this.#configPath; // get path

    // ensure both dir & file exist
    if (!fs.existsSync(configDir)) fs.mkdir(configDir);
    if (!fs.existsSync(path))
      fs.writeFileSync(path, "{}", { encoding: "utf-8" });
  }

  /**
   * Reads the config file for this scope & returns an object representing the encoded data
   * @returns {{[key: string]: any?}}
   */
  #readConfig() {
    this.#ensureConfigFileExists();

    let data = fs.readFileSync(this.#configPath, { encoding: "utf-8" });
    return JSON.parse(data);
  }

  /**
   * Writes a serialized version of the object to the config file
   * @param {{[key: string]: any?}} obj config object to encode
   */
  #writeConfig(obj) {
    this.#ensureConfigFileExists();
    let data = JSON.stringify(obj);
    fs.writeFileSync(this.#configPath, data, { encoding: "utf-8" });
  }

  /**
   * Writes the setting's key & value information to the config file
   * @param {Setting} setting
   * @returns {Scope} this
   */
  persist(setting) {
    let key = setting.name;
    let val = setting.value;

    let obj = this.#readConfig();
    obj[key] = val;
    this.#writeConfig(obj);

    return this;
  }

  // Get //

  /**
   * Gets a command by the specified key
   * @param {string} key exact key
   * @returns {Command?} null if not found
   */
  getCommand(key) {
    throwIfNotA(key, dt.String);

    let toReturn = null;
    forEachSync(this.commands, (command) => {
      if (command.name.toLowerCase() === key.toLowerCase()) toReturn = command;
    });

    return toReturn;
  }

  /**
   * Gets a parameter by the specified key
   * @param {string} key exact key
   * @returns {Param?} null if not found
   */
  getParam(key) {
    throwIfNotA(key, dt.String);

    let toReturn = null;
    forEachSync(this.params, (p) => {
      if (p.name.toLowerCase() === key.toLowerCase()) toReturn = p;
    });

    return toReturn;
  }

  /**
   * Gets a setting by the specified key
   * @param {string} key exact key
   * @returns {Setting?} null if not found
   */
  getSetting(key) {
    let param = this.getParam(key);
    if (!isA(param, Setting)) return null;
    return param;
  }

  /**
   * Gets a scope by the specified key
   * @param {string} key exact key
   * @returns {Scope?} null if not found
   */
  getScope(key) {
    throwIfNotA(key, dt.String);

    let toReturn = null;
    forEachSync(this.scopes, (i_scope) => {
      if (i_scope.name.toLowerCase() === key.toLowerCase()) toReturn = i_scope;
    });

    return toReturn;
  }

  /**
   * Accesses a member of this scope by the specified key. Could return any class from this API or null if nothing was found.
   * @param {string} key exact key
   * @returns {Command|Param|Scope|null}
   */
  get(key) {
    throwIfNotA(key, dt.String);
    let found = this.getCommand(key);
    if (found === null) found = this.getParam(key);
    if (found === null) found = this.getScope(key);
    return found;
  }

  // Call //

  /**
   * Calls a command in this scope with the specified args
   * @param {string} key exact key of the command
   * @param  {...any} args args to pass to the command's callback
   * @returns {Scope} this
   */
  call(key, ...args) {
    throwIfNotA(key, dt.String);
    // TODO
    return this;
  }

  // Add //

  /**
   * Creates a new scope in this one
   * @param {string} key
   * @returns {Scope}
   */
  scope(key) {
    throwIfNotA(key, dt.String);

    let newScope = new Scope(this, key);
    this.scopes.push(newScope);

    // create help command
    let helpCmd = this.command("--help-" + key.replaceAll(/\-+/g, "-"), () => {
      newScope.help();
    });
    helpCmd.showInHelp = false;

    return newScope;
  }

  /**
   * Creates a new parameter in this scope
   * @param {string} key
   * @param {any?} [defaultValue=undefined]
   * @returns {Param}
   */
  param(key, defaultValue = undefined) {
    throwIfNotA(key, dt.String);

    let newParam = new Param(this, key, defaultValue);
    this.params.push(newParam);

    // create help command
    let helpCmd = this.command("--help-" + key.replaceAll(/\-+/g, "-"), () => {
      newParam.help();
    });
    helpCmd.showInHelp = false;

    return newParam;
  }

  /**
   * Creates a new setting in this scope
   * @param {string} key
   * @param {any?} [defaultValue=undefined]
   * @returns {Setting}
   */
  setting(key, defaultValue = undefined) {
    // validate
    throwIfNotA(key, dt.String);

    // create the setting itself
    let newParam = new Setting(this, key, defaultValue);
    this.params.push(newParam);

    // create command to get the value of the setting
    this.command("--get-" + key, () => {
      console.log(newParam.value); // log value
    });

    // create help command
    let helpCmd = this.command("--help-" + key.replaceAll(/\-+/g, "-"), () => {
      newParam.help();
    });
    helpCmd.showInHelp = false;

    return newParam;
  }

  /**
   * Creates a new command in this scope
   * @param {string} key the key to access this command
   * @param {(...any)=>void} callbackfn the function to be called when the command is invoked
   * @returns {Command}
   */
  command(
    key,
    callbackfn = () => {
      throwIfNotA(key, dt.String);
      Command.NotImplemented(key);
    },
  ) {
    throwIfNotA(key, dt.String);

    let cmd = new Command(this, key, callbackfn);
    this.commands.push(cmd);

    if (key.startsWith("--help-")) return cmd; // please don't create a help command for the help command

    // create help command
    let helpCmd = this.command("--help-" + key.replaceAll(/\-+/g, "-"), () => {
      cmd.help();
    });
    helpCmd.showInHelp = false;

    return cmd;
  }
}
