import("../src/main.js").then((CLI) => {
  /// References
  const App = CLI.default;
  const Type = CLI.Type;
  const dt = Type.DataType;

  /// Build app
  const app = new App("Calculator");

  // Main Scope
  app
    .command("add", (a, b) => console.log(a + b))
    .alias("plus")
    .arg("a", dt.Number)
    .arg("b", dt.Number);

  app
    .command("subtract", (a, b) => console.log(a - b))
    .alias("sub")
    .arg("a", dt.Number)
    .arg("b", dt.Number);

  app
    .command("multiply", (a, b) => console.log(a * b))
    .alias("mul")
    .arg("a", dt.Number)
    .arg("b", dt.Number);

  app
    .command("divide", (a, b) => console.log(a / b))
    .arg("a", dt.Number)
    .arg("b", dt.Number);

  // Geometry Scope
  let geo = app.scope("geometry").describe("Geometry-focused math commands");

  geo
    .command("pythagoras", (a, b) => console.log(Math.sqrt(a * a + b * b)))
    .alias("pytha")
    .arg("a", dt.Number)
    .arg("b", dt.Number)
    .describe("Displays the square root of a^2 + b^2");

  /// Start
  app.start();
});
