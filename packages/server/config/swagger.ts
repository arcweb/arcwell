import path from 'node:path'
import url from 'node:url'

export default {
  // path: __dirname + "/../", for AdonisJS v5
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../', // for AdonisJS v6
  tagIndex: 1,
  info: {
    title: 'Arcwell Platform Server',
    version: '0.0.1.internal',
    description: `<strong>Arcwell Digital Health Platform</strong> \
    <p> \
    Arcwell is an extensible platform for modeling solutions in digital \
    health including clinical pathways, captured data including patient \
    observations, and powering the delivery and management of clinical trials, \
    surveys, assessments, questionnaires, clinical decision support systems, \
    and more. \
    </p> \
    The Arcwell Server API provides the primary interface for interacting \
    with an individual Arcwell instance. Users and Administrators manipulate \
    Arcwell object types: \
    <ul> \
      <li><strong>People</strong> – Any human about which information, data, and \
      attributes are tracked within this instance</li> \
      <li><strong>Resources</strong> – Items that are not people about which \
      information, data, and attributes are tracked within this instance</li> \
      <li><strong>Events</strong> – Time-aware elements about which information \
      is tracked. Appointments, sessions, individual observations, etc.</li> \
      <li><strong>Cohorts</strong> – Groupings of People for management of trials, \
      clinical delivery, or other uses.</li> \
    </ul> \
    The Arcwell Data System connects informtion about the different Arcwell object \
    types: \
    <ul> \
      <li><strong>FactTypes</strong> – A schema and definition of the <em>types</em> \
      of information stored within this Arcwell. Define parameters for readings, \
      measurements, or other buckets of data you need to store.</li> \
      <li><strong>Facts</strong> – Individual measurements and observations associated \
      with a Person, Resource, and/or Event. Where you store data.</li> \
      <li><strong>Fact Dimensions</strong> – Add depth to Fact records with \
      customizable units, measurements, and info fields.</li> \
    </ul> \
    <p>Learn more about Arcwell at <a href="https://arcwell.health">arcwell.health</a>.</p> \
    <p>Track, view, and fork the Arcwell codebase <a href="https://github.com/arcweb/arcwell">on Github</a>.</p> \
    `,
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
    parameters: {
      sortable: [
        {
          in: 'query',
          name: 'sort',
          schema: { type: 'string', example: 'foo' },
        },
        {
          in: 'query',
          name: 'order',
          schema: { type: 'string', example: 'ASC' },
        },
      ],
      filterable: [
        {
          in: 'query',
          name: 'filter',
          schema: { type: 'object', example: '[eq]=bar' },
        },
      ],
    }, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  securitySchemes: {}, // optional
  authMiddlewares: ['auth', 'auth:api'], // optional
  defaultSecurityScheme: 'BearerAuth', // optional
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: true, // the path displayed after endpoint summary
}
