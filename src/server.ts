import { createServer } from 'http';
import { Duplex } from 'stream';

const stream = new Duplex();

export const server = createServer((req, res) => {
  if (req.url === "/stream") {
    res.writeHead(200, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Transfer-Encoding': 'chunked'
    });
    res.flushHeaders();
    res.write("[\n");
    stream.pipe(res);
    let count = 0;
    const interval = setInterval(() => {
      if (count > 10) { res.end(']'); clearInterval(interval); }
      count++;
      res.write('{ "type": "ping" },');
      res.write('\n');
    }, 1000);
    return;
  }
  res.end(req.url);
});

export const send = function send(type: string, object: any) {
  stream.write(JSON.stringify({
    type,
    object
  }, null, 2));
  stream.write(',\n');
};

export const getPort = function getPort() {
  const address = server.address();
	return typeof address === 'string' ? address : address?.port;
};
