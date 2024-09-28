import path from 'node:path'
import url from 'node:url'

export default {
  // path: __dirname + "/../", for AdonisJS v5
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../', // for AdonisJS v6
  tagIndex: 1,
  info: {
    title: 'Arcwell Server',
    version: '0.0.1.internal',
    description: 'Arcwell Digital Medicine Platform',
    license: {
      name: 'Apache-2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
    externalDocs: {
      description: 'Learn more about the Arcwell Server and its implementation',
      url: 'https://github.com/arcweb/arcwell',
    },
  },
  snakeCase: false,

  debug: true, // set to true, to get some useful debug output
  ignore: ['/docs/*'],
  preferredPutPatch: 'PATCH',
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  securitySchemes: {}, // optional
  authMiddlewares: ['auth', 'auth:api'], // optional
  defaultSecurityScheme: 'BearerAuth', // optional
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: true, // the path displayed after endpoint summary
}
