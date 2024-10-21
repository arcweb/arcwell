import { request as _request } from 'node:http'

const options = {
  host: 'localhost',
  path: '/health',
  port: '3333',
  timeout: 2000,
}

const request = _request(options, (res) => {
  console.log(`Healthcheck Status: ${res.statusCode}`)
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

request.on('error', () => {
  console.log('Healthcheck failure.')
  process.exit(1)
})

request.end()
