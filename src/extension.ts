// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { server, send, getPort } from './server';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "diffstream" is now active!');

	vscode.workspace.onDidChangeTextDocument((change) => {
		const { document: { fileName }, contentChanges } = change;
		send("changeTextDocument", { fileName, contentChanges });
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let startServerDisposable = vscode.commands
	.registerCommand('diffstream.startServer', () => {
		// The code you place here will be executed every time your command is executed
		const port = getPort();
		if (!server.address()) {
			server.listen(()=> {
				const port = getPort();
				vscode.window.showInformationMessage(`diffstream server running at port ${port}`);
			});
		} else {
			vscode.window.showInformationMessage(`Server also running at port ${port}`);
		}
	});

	let endServerDisposable = vscode.commands
	.registerCommand('diffstream.endServer', () => {
		// The code you place here will be executed every time your command is executed
		server.close(() => {
			vscode.window.showInformationMessage('Server correctly closed');
		});
		// Display a message box to the user
	});

	context.subscriptions.push(startServerDisposable);
	context.subscriptions.push(endServerDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
