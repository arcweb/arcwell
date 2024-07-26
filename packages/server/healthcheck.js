import { request as _request } from 'node:http'

var options = {
  host: 'localhost',
  path: '/health',
  port: '3333',
  timeout: 2000,
}

var request = _request(options, (res) => {
  console.log(`Healthcheck Status: ${res.statusCode}`)
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

// eslint-disable-next-line handle-callback-err
request.on('error', (err) => {
  console.log('Healthcheck failure.')
  process.exit(1)
})

request.end()
