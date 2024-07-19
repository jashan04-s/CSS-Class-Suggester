const vscode = require('vscode');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

let cssClasses = new Set();

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

function scanCSSFiles() {
  cssClasses.clear();
  vscode.workspace.findFiles('**/*.css').then(files => {
    files.forEach(file => {
      const content = fs.readFileSync(file.fsPath, 'utf8');
      const classRegex = /\.([a-zA-Z0-9_-]+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        cssClasses.add(match[1]);
      }
    });
    console.log('CSS classes scanned:', cssClasses);
  });
}

function activate(context) {

  console.log('Congratulations, your extension "css-class-suggester" is now active!');

  //Scan CSS files on startup
  scanCSSFiles();

  //Command to manually scan CSS files
  let scanCommand = vscode.commands.registerCommand('css-class-suggester.scanCSSFiles', scanCSSFiles);
  context.subscriptions.push(scanCommand);

  //Watch for changes in CSS files
  let watcher = vscode.workspace.createFileSystemWatcher('**/*.css');
  watcher.onDidChange(scanCSSFiles);
  watcher.onDidCreate(scanCSSFiles);
  watcher.onDidDelete(scanCSSFiles);
  context.subscriptions.push(watcher);

  // Function to provide suggestions for CSS classes in HTML/JS/TS/JSX/TSX files
  let provider = vscode.languages.registerCompletionItemProvider(
    ['html', 'javascript', 'typescript'],
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('class="') && !linePrefix.endsWith('className="')) {
          return undefined;
        }

        return Array.from(cssClasses).map(className => new vscode.CompletionItem(className, vscode.CompletionItemKind.Value));
      }
    },
    '"' // Trigger completion after typing a quote
  );

  let disposable2 = vscode.workspace.onDidChangeTextDocument((event) => {
    const changes = event.contentChanges;
    if (changes.length > 0) {
      const change = changes[0];
      vscode.window.showInformationMessage(`You typed: ${change.text}`);
    }
  });
  // context.subscriptions.push(disposable2);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
