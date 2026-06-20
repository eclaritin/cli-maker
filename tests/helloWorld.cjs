import("../src/main.js").then((CLI) => {
  // References
  const App = CLI.default;
  const Type = CLI.Type;
  const dt = Type.DataType;

  // Define app
  const app = new App("Hello World");
  app.version = "1.0.0";
  app.arg("name", dt.String, "World", "The name to say hello to");

  // App behavior
  app.main((name) => {
    console.log(`Hello, ${name}!`);
  });

  // Start
  app.start();
});
