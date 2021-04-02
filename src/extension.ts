import * as vscode from 'vscode';

import { server, send, getPort } from './server';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('[activate] "diffstream" is now active!');

	// WORKSPACE listeners

	vscode.workspace.onDidChangeTextDocument((change) => {
		const { document, contentChanges } = change;
		send("changeTextDocument", { document, contentChanges });
	});

	// WINDOW listeners
	
	vscode.window.onDidChangeActiveTextEditor((textEditor) => {
		send("changeActiveTextEditor", textEditor);
	});

	vscode.window.onDidChangeTextEditorVisibleRanges((ranges) => {
		send("changeTextEditorVisibleRanges", ranges);
	});

	// Commands had been defined in the package.json file
	// Now provide the implementation of the commands with registerCommand
	// The commandId parameter must match the command field in package.json

	let startServerDisposable = vscode.commands
	.registerCommand('diffstream.startServer', () => {
		// Check if server is enabled and enable it if not
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
		server.close(() => {
			vscode.window.showInformationMessage('Server correctly closed');
		});
	});

	context.subscriptions.push(startServerDisposable);
	context.subscriptions.push(endServerDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	server.close();
}
