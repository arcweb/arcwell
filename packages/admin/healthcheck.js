const http = require('http');

const options = {
    hostname: 'localhost',
    path: '/',
    port: 4200,
    timeout: 5000,
};

const req = http.request(options, (res) => {
    console.log(`Healthcheck Status: ${res.statusCode}`)
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

req.on('error', () => {
    console.log('Healthcheck failure.')
    process.exit(1)
})
req.end();
