const vscode = require('vscode');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */

function getVscodeVersion() {
  try {
    const output = execSync('code --version', { encoding: 'utf8' });
    console.log(output)
    const version = output.split('\n')[0]; // Get the first line of the output
    return version;
  } catch (error) {
    vscode.window.showErrorMessage('Error getting VS Code version: ' + error.message);
    return null;
  }
}

function activate(context) {

  console.log('Congratulations, your extension "css-class-suggester" is now active!');

  const disposable = vscode.commands.registerCommand('css-class-suggester.helloWorld', function () {

    vscode.window.showInformationMessage('Hello World from CSS Class Suggester!');
  });

  context.subscriptions.push(disposable);

  console.log('Extension "typingListener" is now active!');

  let disposable2 = vscode.workspace.onDidChangeTextDocument((event) => {
    const changes = event.contentChanges;
    if (changes.length > 0) {
      const change = changes[0];
      vscode.window.showInformationMessage(`You typed: ${change.text}`);
    }
  });

  context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
