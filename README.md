# CLI-MAKER

A javascript library for easily making CLI applications. Handles ordinal arguments, named parameters, configuration files, & help messages all with minimalistically named methods. A mini-console-app is included that runs when no args are passed; it allows you to navigate the app's scopes & run multiple internal commands easily. The goal of this project is to allow you to focus on writing your program without constantly worrying about parsing command-line args.

## Example

```js
import("cli-maker/main.js").then((CLI) => {
  // References
  const App = CLI.default;
  const dt = CLI.Type.DataType;

  // Define app
  const app = new App("Hello World");
  app.version = "1.0.0";
  app.arg("name", dt.String, "World", "The name to say hello to");
  app.flag("--!", false).describe("Adds an exclamation mark to the message");

  // App behavior
  app.main((name) => {
    console.log(`Hello, ${name}${app.get("--!") ? "!" : "."}`);
  });

  // Start
  app.start();
});
```
