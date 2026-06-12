// CLI-MAKER ~ Library for making CLI apps

/////////////////////////////////////////////////////////////////////////////////
// API reference plan

/*

new Param(private #scopeRef: CLI.Scope):
    name: string = "param"; // used for searching in scope.get____() and in the help message
    value: any? = null;
    parent: CLI.Scope ( get => this.#scopeRef; )

    comment: string = ""; // used for help message
    helpMessage: string ( get; )

new Setting extends Param:
    override name: string = "setting";
    private #value: any? = null;
    override value: any? ( get; set; ) // calls this.onChange & then this.persist after setting
    onChange: (newValue: any?)=>any? // if a value is returned by this function, it becomes the new value

    persist() => CLI.Setting // writes or overwrites this setting to the config file managed by the parent scope

new Command extends Param:
    override name: string = "command";
    override value: (...args)=>void = Command.NotImplementedCallback;
    params: CLI.Param[] = [];

    exec(...any) => void; // executes the callback with the specified arguments
    execWithParams(...any) => void // assigns all parameters, then calls the main exec method with params filtered out of args
    
    static NotImplementedCallback(name: string) => void; // displays `Sorry, but the command '${name}' has not been implemented yet.`
    static NotFoundCallback(name: string) => void; // displays `Sorry, but the command '${name}' was not found in this scope.`

new Scope:
    name: string = "scope"; // used for accessing in scope.get____() and in the help message
    commands: CLI.Command[] = [];
    params: CLI.Param[] = [];
    scopes: CLI.Scope[] = [];

    comment: string = ""; // used in the help message
    helpMessage: string ( get; )
    help()=>void; // displays the help message

    private #configPath: string ( get; ) // returns a string starting with app working directory, then the names of each scope from CLI.App.name to here (periods as separators), then ending in .json
    private #readConfig() => object // synchronously reads config file & parses to an object
    private #writeConfig(obj: object) => void; // synchronously writes a serialized version of the object to the config file
    persist(setting: Setting) => CLI.Scope; // writes the setting's key & value information to the config file
    readonly config: object ( get; ) // returns a readonly version of this.#configOBJ

    getCommand(key: string) => CLI.Command?;
    getParam(key: string) => CLI.Param?;
    getSetting(key: string) => CLI.Setting?; // basically getParam but validation for if the param is a setting
    getScope(key: string) => CLI.Scope?;
    get(key: string) => CLI.Command | CLI.Param | CLI.Scope | undefined;

    scope(key: string) => CLI.Scope; // creates a new scope
    setting(key: string, defaultValue: any?) => CLI.Scope; // creates a new setting in this.params (polymorphism babey :3)
    param(key: string, defaultValue: any?) => CLI.Scope; // creates a new param in this.params
    command(key: string, callbackfn: (...any)=>void) => CLI.Scope;

    call(key: string, ...any) => void; // runs a command with the specified args. if not found, runs CLI.Command.NotFoundCallback(key)

new App extends Scope:
    override name: string = FILENAME | PACKAGENAME (if FILENAME.lower().trim() === "index.js" | "main.js");
    
    mainCallback: ((...any)=>void)? = null; // default callback that is run when no actions or commands are specified
    errorCallback: ((reason: any?)=>void)? = null; // top-level callback that is run when an unhandled error is encountered
    main((...any)=>void) => CLI.App; // sets the main callback
    error((reason: any?)=>void); // sets the error callback

    parseArgs(...string) => void; // performs whatever actions or commands are specified, alternatively runs this.main if no actions are specified
    
    defaultLoop()=>void; // if mainCallback isn't specified, this runs instead of it. a terminal-like loop where you can enter different scopes & perform actions & commands more easily.
    
*/

/////////////////////////////////////////////////////////////////////////////////
// Fake implementation for planning

const CLI = require("cli-maker-lib").App;

let cli = new CLI();

cli.scope("auth"); // creates a new scope

cli.command("run", (...args) => {
  /* ... */
}); // creates a command with a callback

cli.param("verbose", false); // creates a parameter (does not persist; used temporarily for this specific run)

cli.setting("idk", 123); // creates a setting (does persist, adds to scope-specific config file)

cli.mainLoop(); // run main loop to navigate the app
