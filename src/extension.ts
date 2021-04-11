import * as vscode from 'vscode';

import { server, send, getPort } from './server';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('[activate] "diffstream" is now active!');

	// WORKSPACE listeners

	vscode.workspace.onDidChangeTextDocument((textDocumentChange) => {
		const { document, contentChanges } = textDocumentChange;
		const content = document.getText();
		send("changeTextDocument", { document, contentChanges, content });
	});

	vscode.workspace.onDidCreateFiles(({ files }) => {
		// Each file is an Uri
		send("fileCreated", { files });
	});

	vscode.workspace.onDidDeleteFiles(({ files }) => {
		// Each file is an Uri
		send("fileDeleted", { files });
	});

	vscode.workspace.onDidRenameFiles(({ files }) => {
		// Here each file is { oldUri: Uri, newUri: Uri }
		send("fileRenamed", { files });
	});

	vscode.workspace.onDidSaveTextDocument((textDocument) => {
		send("savedTextDocument", textDocument);
	});

	// WINDOW listeners
	
	vscode.window.onDidChangeActiveTextEditor((textEditor) => {
		const content = textEditor?.document.getText();
		send("changeActiveTextEditor", { textEditor, content });
	});

	vscode.window.onDidChangeTextEditorVisibleRanges((visibleRangesChange) => {
		send("changeTextEditorVisibleRanges", visibleRangesChange);
	});

	vscode.window.onDidChangeTextEditorSelection((selectionChange) => {
		send("changeTextEditorSelection", selectionChange);
	});

	vscode.window.onDidChangeTextEditorViewColumn((viewColumnChange) => {
		send("changeTextEditorViewColumn", viewColumnChange);
	});

	vscode.window.onDidChangeWindowState((windowState) => {
		send("changeWindowState", windowState);
	});

	vscode.window.onDidChangeActiveTerminal((terminal) => {
		send("changeActiveTerminal", terminal);
	});

	// Commands had been defined in the package.json file
	// Now provide the implementation of the commands with registerCommand
	// The commandId parameter must match the command field in package.json

	let startServerDisposable = vscode.commands
	.registerCommand('diffstream.startServer', () => {
		// Check if server is enabled and enable it if not
		let port = getPort();
		if (!server.address()) {
			server.listen(()=> {
				port = getPort();
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
