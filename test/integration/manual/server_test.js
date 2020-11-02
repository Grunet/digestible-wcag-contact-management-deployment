require("dotenv").config({
  path: require("find-config")(".env", { cwd: __dirname }),
});

const { spawn } = require("child_process");

const server = spawn("node", ["./packages/api/server.js"]);

server.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

server.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

server.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
