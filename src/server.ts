import { createServer } from 'http';
import { createReadStream } from 'fs';
import { join } from 'path';
import { PassThrough } from 'stream';

const p = join(__dirname, '..', 'static');
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
