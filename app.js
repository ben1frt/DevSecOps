const http = require('http');

const SIMULATED_AWS_KEY = process.env.SIMULATED_AWS_KEY || "default_dev_key";
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "default_internal_token";

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello DevSecOps World! AWS Key length: ${SIMULATED_AWS_KEY.length}\n`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
