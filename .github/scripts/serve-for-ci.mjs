// Static file server for CI (Lighthouse). A plain `serve`/http-server process
// inherits Node's default keepAliveTimeout of 5s: Chrome pools a persistent
// connection for the whole Lighthouse run (60s+), and a late fetch (e.g. the
// robots.txt audit, which runs well after initial page load) can reuse a
// connection the server already dropped, failing with a generic network
// error. Raising keepAliveTimeout avoids that.
import http from "node:http";
import handler from "serve-handler";

const server = http.createServer((req, res) => handler(req, res, { public: process.argv[2] || "." }));
server.keepAliveTimeout = 120_000;
server.headersTimeout = 121_000; // must exceed keepAliveTimeout (Node requirement)

const port = Number(process.argv[3] || 8080);
server.listen(port, () => {
  console.log(`Serving ${process.argv[2] || "."} at http://localhost:${port}`);
});
