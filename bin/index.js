#!/usr/bin/env node

const { fstat } = require("fs");
const { exit } = require("process");
const termkit = require('terminal-kit');
const term = termkit.terminal;
const childProcess = require('child_process');

const load = require(__dirname + '/ereader.js');


boxen = require("boxen"),
fs = require('fs'),
shell = require('shelljs')


const commands = [{command:"exit", function: "process.exit()"},{command:"anishelf", function: "openAnishelf()"},{command:"reader", function: "openReader()"}]

openAnishelf = () => {
    shell.exec(__dirname+'/anishelf.bat')
    getCommand();
}

openReader = () => {
    loadChapter();
}


getCommand = () => {
    term("What program should I open up?\n")
    term.inputField(function(error, ans) {
        console.log(ans)
        var command = commands.find(element => element.command === ans.split(" ")[0]);
        if (command === undefined) getCommand();
        else {
            return eval(command.function);
        }
    });
}

term.clear();
getCommand();