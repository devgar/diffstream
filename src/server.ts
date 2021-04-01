import { createServer } from 'http';

export const server = createServer((req, res) => {
  res.end(req.url);
});