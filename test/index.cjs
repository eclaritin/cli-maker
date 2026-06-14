const argv = require('process').argv;

import("../src/main.js").then((CLI) => {
  // Build app
  const app = new CLI.App();

  // Experiment
  app.start(argv);
});
