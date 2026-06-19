import("../src/main.js").then((CLI) => {
  // References
  const App = CLI.default;
  const Type = CLI.Type;
  const dt = Type.DataType;

  // Build app
  const app = new App("Calculator");

  app
    .command("addition", (a, b) => {
      console.log(a + b);
    })
    .alias("add")
    .arg("a", dt.Number)
    .arg("b", dt.Number);

  app
    .command("subtract", (a, b) => {
      console.log(a - b);
    })
    .alias("sub")
    .arg("a", dt.Number)
    .arg("b", dt.Number);

  // Start
  app.start();
});
