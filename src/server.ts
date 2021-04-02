import { createServer } from 'http';
import { PassThrough } from 'stream';

const stream = new PassThrough();

export const server = createServer((req, res) => {
  if (req.url === "/stream") {
    res.writeHead(200, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type": "application/json",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Transfer-Encoding": "chunked"
    });
    res.flushHeaders();
    res.write("[\n");
    stream.pipe(res);
    let count = 0;
    const _interval = setInterval(() => {
      // if (count > 10) { res.end(']'); clearInterval(_interval); }
      count++;
      res.write(`{ "type": "ping", "count": ${count} },\n`);
    }, 1000);
    return;
  }
  res.end(req.url);
});

export const send = function send(type: string, data: any) {
  stream.write(JSON.stringify({
    type,
    data
  }, null, 2));
  stream.write(",\n");
};

export const getPort = function getPort() {
  const address = server.address();
	return typeof address === "string" ? address : address?.port;
};
