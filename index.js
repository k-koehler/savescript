#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");
const ttys = require("ttys");

const homeDir = os.homedir();
const binDir = path.join(homeDir, ".savescript");

function getHistoryFile() {
  if (process.env.SHELL.includes("zsh")) {
    return path.join(homeDir, ".zsh_history");
  }
  return path.join(homeDir, ".bash_history");
}

function getLastCommand() {
  const commands = fs.readFileSync(getHistoryFile()).toString().split("\n");
  const modeCommand = commands[commands.length - 2];
  let lastCommand = "";
  if (modeCommand.includes("savescript") && modeCommand.includes("|")) {
    const [cmdPart] = modeCommand.split("|");
    lastCommand = cmdPart;
  } else {
    lastCommand = commands[commands.length - 3];
  }
  if (lastCommand.startsWith(":")) {
    return lastCommand.slice(15);
  }
  return lastCommand;
}

function getProfileFile() {
  if (process.env.SHELL.includes("zsh")) {
    return path.join(homeDir, ".zshrc");
  } else if (process.env.SHELL.includes("bash")) {
    return path.join(homeDir, ".bashrc");
  }
  return path.join(homeDir, ".profile");
}

function safeAppend(fp, s) {
  if (!fs.readFileSync(fp).toString().includes(s)) {
    fs.appendFileSync(fp, s);
  }
}

function err(s) {
  console.log("\x1b[31m", s);
}

function warn(s) {
  console.log("\x1b[33m", s);
}

function question(q) {
  return new Promise((res) => {
    const stdin = readline.createInterface({
      input: ttys.stdin,
      output: ttys.stdout,
    });
    stdin.question(q, (a) => res(a));
  });
}

// three possibilities:
// 0. invalid syntax
// 1. savescript has never been invoked
//   -> create BIN_DIR and export it to path
//   -> save the script
//   -> tell the user to refresh their shell
// 2. BIN DIR has been created, but the user didn't refresh their shell
//   -> save the script, but warn the user that they don't be able to access
//   ... said script
// 3. everything is working properly

(async function main() {
  if (process.argv.length < 3) {
    err("Invalid syntax. Usage: savescript <filename>");
    process.exit(1);
  }

  let message = undefined;

  function exit() {
    if (message) {
      message();
    }
    process.exit(0);
  }

  const profileFile = getProfileFile();

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir);
    message = () =>
      warn(
        `First time running savescript detected. Please type "source ${profileFile}" or reload your shell.`
      );
  }

  if (!process.env.PATH.includes(binDir)) {
    safeAppend(profileFile, `export PATH=$PATH:${binDir}`);
    if (!message) {
      message = () =>
        warn(`Please type "source ${profileFile}" or reload your shell.`);
    }
  }

  const lastCommand = getLastCommand();
  const commandName = process.argv[2];
  const fname = path.join(binDir, commandName);

  if (fs.existsSync(fname)) {
    let yn = "";
    do {
      yn = await question(`${commandName} already exists. Overwrite? (yn) `);
    } while (yn !== "y" && yn !== "n");
    if (yn === "n") {
      exit();
    }
  }

  fs.writeFileSync(fname, lastCommand);
  fs.chmodSync(fname, "755");
  exit();
})();
