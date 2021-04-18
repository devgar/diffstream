import { createServer } from 'http';
import { createReadStream, promises as fs } from 'fs';
import { join, extname } from 'path';
import { PassThrough } from 'stream';

import * as vscode from 'vscode';
import { errorMonitor } from 'node:events';

const p = join(__dirname, '..', 'static');
const m = join(__dirname, '..', 'node_modules');
const stream = new PassThrough();

export const server = createServer((req, res) => {
  if (req.url === "/stream") {
    res.writeHead(200, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type": "text/event-stream",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Connection": "keep-alive",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Cache-Control": "no-cache"
      //"Transfer-Encoding": "chunked"
    });
    res.flushHeaders();

    const textEditor = vscode.window.activeTextEditor;
    if (textEditor) {
      
      const obj = {
        fileName: textEditor.document.fileName,
        language: textEditor.document.languageId,
        content: textEditor.document.getText()
      };
      res.write(`event: initial\n`);
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
      
    }
    stream.pipe(res);
    let count = 0;
    const _interval = setInterval(() => {
      // if (count > 10) { res.end(']'); clearInterval(_interval); }
      count++;
      res.write(`event: ping\n`);
      res.write(`data: ${new Date()}\n\n`);
    }, 10_000);
    return;
  }
  if (req.url === '/') {
    res.writeHead(200, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type": "text/html"
    });
    createReadStream(join(p, "index.html")).pipe(res);
    return;
  }

  if (req.url?.startsWith('/modules/')) {

    const route = join(m, req.url.slice(9));
    fs.stat(route).then(stats => {
      if (stats.isFile()) {
        const headers = {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Content-Type": "text/javascript "
        };
        res.writeHead(200, headers);
        createReadStream(route).pipe(res);
      } else { throw new Error(); }
    }).catch(err => {
      res.writeHead(404);
      res.end('NOT FOUND (or other error)\n' + JSON.stringify(err, null, 2));
    });
    return;
  }

  res.writeHead(404);
  res.end("Not FOUND");
});

export const getPort = function getPort() {
  const address = server.address();
	return typeof address === "string" ? address : address?.port;
};

export const send = function send(type: string, data: any) {
  if (getPort()) {
    stream.write(`event: ${type}\n`);
    stream.write(`id: ${(new Date()).getTime()}\n`);
    stream.write(`data:  ${JSON.stringify(data)}\n\n`);
  }
};
