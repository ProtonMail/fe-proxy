const http = require('http');
const argv = require('minimist')(process.argv.slice(2));

const port = argv.port || 8040;

const createResolver = (routes = []) => {
    if (!Array.isArray(routes) || routes.length <= 0) {
        throw new Error('Nothing to route');
    }

    const paths = routes.map((route) => {
        const split = route.split(' ');
        if (split.length > 2) {
            throw new Error('Invalid route specified');
        }
        if (split.length === 1) {
            split.unshift('')
        }
        const [regexString, urlString] = split;
        return [new RegExp(regexString), new URL(urlString)];
    });

    console.log('Routes:\n');
    console.log(paths.map(path => path.join(' -> ')).join('\n'));
    console.log('');

    return (url) => {
        const result = paths.find(([regex, toUrl]) => {
            if (regex.test(url)) {
                return toUrl;
            }
        });
        if (!result) {
            throw new Error('No match found');
        }
        const [, toUrl] = result;
        return toUrl;
    }
};

const resolver = createResolver(argv.route);

const server = http.createServer((req, res) => {
    const { method, url, headers } = req;
    const toUrl = resolver(url);
    console.log(`[${method}] ${url} -> [${method}] ${toUrl.hostname}:${toUrl.port}${url}`);

    const proxyOptions = {
        port: toUrl.port,
        hostname: toUrl.hostname,
        path: url,
        headers,
        method
    };

    const proxyCallback = (proxyResult) => {
        res.writeHead(proxyResult.statusCode, proxyResult.headers);
        proxyResult.pipe(res);
    };

    const proxyReq = http.request(proxyOptions, proxyCallback);

    proxyReq.on('error', (e) => {
        console.error('Proxy request fail: ' + e.message, e);
        res.writeHead(500);
        res.end();
    });

    req.pipe(proxyReq)
});


server.listen(port, () => console.log(`URL: http://localhost:${port}/`));

