import App from "./App.mjs";
import Arg from "./Arg.mjs";
import Param from "./Param.mjs";
import Scope from "./Scope.mjs";
import Setting from "./Setting.mjs";
import { getClass } from "./Type.mjs";
import Command from "./Command.mjs";

/**
 * Generates a help message for the current item
 * @param {Param|Scope|App|Command|Arg} obj
 * @returns {string}
 */
export function genHelp(obj) {
  // Call the right help generator function depending on what type the obj is
  if (obj instanceof App) return genHelp_App(obj);
  else if (obj instanceof Scope) return genHelp_Scope(obj);
  else if (obj instanceof Command) return genHelp_Command(obj);
  else if (obj instanceof Setting) return genHelp_Setting(obj);
  else if (obj instanceof Param) return genHelp_Param(obj);
  else if (obj instanceof Arg) return genHelp_Arg(obj);
  else
    // Throw error if not one of the expected types
    throw new TypeError(
      `Expected instanceof Scope, Param, Arg, or one of its subclasses, but got '${obj}' instead!`,
    );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Internal functions //

/** @param {App} app @returns {string} */
function genHelp_App(app, displayExample = true) {
  let mainCallbackDesc = `[Example]\n> node ${process.argv[1]} `;

  mainCallbackDesc += genHelp_Args(app.mainArgs);

  return `[[${app.name} ${app.version}]]${app.comment !== "" ? ` - ${app.comment}` : ""}${app.showExampleUsageInHelpMessage ? `\n\n${mainCallbackDesc}` : ""}\n\n${genHelp_Scope(app, true)}`;
}

/** @param {Scope} scope @returns {string} */
function genHelp_Scope(scope, mainScope = false) {
  const scopes = scope.scopes;
  const commands = scope.commands;
  const params = scope.params;
  const settingsBody = ""; // settings should display separate from params (we'll add them to this array as we loop through params)

  let message = mainScope
    ? "[[Available in This Scope]]\n"
    : `[[${scope.absolutePath}]]${scope.comment !== "" ? ` - ${scope.comment}` : ""}\n`;
  message += `(to get information on a specific option type --help-[name])\n\n`;

  // let's loop through each of these arrays, building up the help message! //

  if (params.length > 0) {
    let DONT_ADD_NEWLINE_IF_THIS_IS_ZERO = 0; // prevents the extra new line bug that happens when only settings are present in scope.params

    for (let i = 0; i < params.length; i++) {
      let child = params[i];

      if (!child.showInHelp) continue;

      if (child instanceof Setting) {
        settingsBody += `${child.name}${child.value === undefined ? "" : `[ = ${child.value}]`} - ${child.comment}\n`;
        continue;
      }

      DONT_ADD_NEWLINE_IF_THIS_IS_ZERO++;

      message += `${child.name}${child.value === undefined ? "" : `[ = ${child.value}]`} - ${child.comment}\n`;
    }
    message += DONT_ADD_NEWLINE_IF_THIS_IS_ZERO !== 0 ? "\n" : "";
  }

  if (settingsBody !== "") {
    message += `[Settings]\n${settingsBody}`;
    message += "\n";
  }

  if (commands.length > 0) {
    message += "[Commands]\n";
    for (let i = 0; i < commands.length; i++) {
      let child = commands[i];
      if (!child.showInHelp) continue;
      message += `${child.name}${child.args.length > 0 ? " " + genHelp_Args(child.args) : ""}${child.comment !== "" ? ` - ${child.comment}` : ""}\n`;
    }
    message += "\n";
  }

  if (scopes.length > 0) {
    message += "[Scopes]\n";
    for (let i = 0; i < scopes.length; i++) {
      let child = scopes[i];
      if (!child.showInHelp) continue;
      message += `${child.name} - ${child.comment}\n`;
    }
    message += "\n";
  }

  return message;
}

/** @param {Command} cmd @returns {string} */
function genHelp_Command(cmd) {
  let message = `${cmd.name} ${genHelp_Args(cmd.args)}`;
  if (cmd.comment !== "") message += " - " + cmd.comment + "\n";
  else message += "\n";

  for (let i = 0; i < cmd.args.length; i++) {
    let arg = cmd.args[i];
    message += genHelp_Arg(arg) + "\n";
  }

  message += "\n";

  return message;
}

/** @param {Param[]} params @returns {string} */
function genHelp_SettingsFromParams(params) {
  let n_settings = 0;
  let msg = "[Settings] ";
  msg += "(to read the value of a setting, run --get-[settingName])\n";

  for (let i = 0; i < params.length; i++) {
    if (!(params[i] instanceof Setting)) continue;
    n_settings++;
    msg += genHelp_Param(params[i]);
  }

  return n_settings > 0 ? msg : "";
}

/** @param {Setting} sParam @returns {string} */
function genHelp_Setting(sParam) {
  return `${genHelp_Param(sParam)}\n--get-${sParam.name} - logs the value of this setting to the console\n`;
}

/** @param {Param} param @returns {string} */
function genHelp_Param(param) {
  return `${param.name}${param.value === undefined ? "" : `[ = ${param.value}]`}${param.comment !== "" ? ` - ${param.comment}` : ""}`;
}

/** @param {Arg} arg @returns {string} */
function genHelp_Arg(arg) {
  let message = `${arg.name}: ${typeof arg.type === "string" ? arg.type : getClass(arg.type) || "object"}`;
  if (arg.optional) message = `[${message}]`;
  if (arg.comment !== "") message += ` - ${arg.comment}`;
  return message;
}

/** @param {Arg[]} argArray @returns {string} */
function genHelp_Args(argArray) {
  // create array of arg names (formats optional args as well)
  let formattedArgs = argArray.map((arg, i) => {
    if (arg.optional)
      return `[${arg.name}=${arg.default}]`; // applies optional arg format: [argName=defaultValue]
    else return arg.name;
  });

  return formattedArgs.join(" ");
}
