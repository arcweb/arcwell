const axios = require('axios');
const dotenv = require('dotenv');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const readline = require('readline');
const { AxiosInstance } = require('axios');

dotenv.config();

interface InstallResponse {
  data: {
    counts: {
      fact_types: number;
      people: number;
      person_types: number;
      resource_types: number;
      event_types: number;
      tags: number;
      roles: number;
      users: number;
    };
    createdObjects?: {
      fact_types: FactType[];
      people: Person[];
      person_types: PersonType[];
      resource_types: any[];
      event_types: any[];
      tags: Tag[];
      roles: Role[];
      users: User[];
    };
  };
}

interface Role {
  id: string;
  name: string;
}

interface PersonType {
  id: string;
  name: string;
  key: string;
}

interface Tag {
  id: string;
  pathname: string;
}

interface Person {
  id: string;
  familyName: string;
  givenName: string;
  typeKey: string;
  tags: string[];
}

interface User {
  id: string;
  email: string;
  roleId: string;
  personId: string;
  tags: string[];
}

interface FactType {
  id: string;
  key: string;
  name: string;
  description: string;
  dimensionSchemas: DimensionSchema[];
  tags: string[];
}

interface DimensionSchema {
  key: string;
  name: string;
  dataType: string;
  dataUnit: string;
  isRequired: boolean;
}

// Define command-line arguments
const argv = yargs.default(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    description: 'Email for the user',
    type: 'string',
    demandOption: true
  })
  .option('password', {
    alias: 'p',
    description: 'Password for the user',
    type: 'string',
    demandOption: false
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// Function to securely prompt for a password if not provided
async function promptPassword(promptText: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  return new Promise((resolve) => {
    rl.question(promptText, (password: any) => {
      rl.close();
      resolve(password);
    });
  });
}

// Function to validate email format
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Initialize Axios instance with base URL and headers
const backendUrl = process.env['DEVELOPMENT_API_URL'];
let authToken = process.env['AUTH_TOKEN'];

if (!backendUrl) {
  console.error('Error: BACKEND_URL is not defined in .env');
  process.exit(1);
}

if (!authToken) {
  console.error('Warning: AUTH_TOKEN is not defined in .env');
  process.exit(1);
}

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
  },
});

// Utility function to make POST requests to /config/install
async function installConfig(payload: any): Promise<InstallResponse> {
  try {
    const response = await api.post('/config/install', payload, {
      params: { returnObjects: 'true' },
    });
    return response.data as InstallResponse;
  } catch (error: any) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      // No response received
      console.error('API Error: No response received from the server.');
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    process.exit(1); // Exit immediately on any error
  }
}

// Main function to orchestrate the installation
async function main() {
  try {
    console.log('=== Seed Data Installation ===\n');

    // Validate email format
    if (!validateEmail(argv.email)) {
      console.error('Error: Invalid email format.');
      process.exit(1);
    }

    // Handle password input
    let password = argv.password;
    if (!password) {
      password = await promptPassword('Enter password for the user: ');
      if (!password) {
        console.error('Error: Password is required to create a user.');
        process.exit(1);
      }
    }

    // Step 1: Create person_types, roles, and tags
    console.log('Step 1: Creating Person Types, Roles, and Tags...');
    const initialPayload = {
      person_types: [
        { name: 'Survey User', key: 'survey-user' }
      ],
      roles: [
        { name: 'Survey User' }
      ],
      tags: [
        { pathname: 'survey' }
      ]
    };

    const initialResponse = await installConfig(initialPayload);
    const createdPersonTypes = initialResponse.data.createdObjects?.person_types || [];
    const createdRoles = initialResponse.data.createdObjects?.roles || [];
    const createdTags = initialResponse.data.createdObjects?.tags || [];

    // Extract roleId and typeKey
    const role = createdRoles.find(r => r.name === 'Survey User');
    if (!role) {
      console.error('Error: Failed to create the Survey User role.');
      process.exit(1);
    }
    const roleId = role.id;

    const personType = createdPersonTypes.find(pt => pt.key === 'survey-user');
    if (!personType) {
      console.error('Error: Failed to create the Survey User person type.');
      process.exit(1);
    }
    const typeKey = personType.key;

    const surveyTag = createdTags.find(t => t.pathname === 'survey')?.pathname;
    if (!surveyTag) {
      console.error('Error: Failed to create the survey tag.');
      process.exit(1);
    }

    console.log('Created Person Types:', createdPersonTypes.length);
    console.log('Created Roles:', createdRoles.length);
    console.log('Created Tags:', createdTags.length);
    console.log('-----------------------------------\n');

    // Step 2: Create Person
    console.log('Step 2: Creating Person...');
    const personPayload = {
      people: [
        {
          familyName: 'Doe',
          givenName: 'John',
          typeKey: typeKey,
          dimensions: [
            { key: 'age', value: '30' },
            { key: 'department', value: 'Engineering' }
          ]
        }
      ]
    };
    const personResponse = await installConfig(personPayload);
    const createdPeople = personResponse.data.createdObjects?.people || [];
    if (createdPeople.length === 0) {
      console.error('Error: Failed to create person.');
      process.exit(1);
    }
    const person = createdPeople[0];
    const personId = person.id;
    console.log('Created Person:', person.id);
    console.log('-----------------------------------\n');

    // Step 3: Create User
    console.log('Step 3: Creating User...');
    const userPayload = {
      users: [
        {
          email: argv.email,
          password: password,
          roleId: roleId,
          personId: personId,
        }
      ]
    };
    const userResponse = await installConfig(userPayload);
    const createdUsers = userResponse.data.createdObjects?.users || [];
    if (createdUsers.length === 0) {
      console.error('Error: Failed to create user.');
      process.exit(1);
    }
    const user = createdUsers[0];
    console.log('Created User:', user.id);
    console.log('-----------------------------------\n');

    // Step 4: Create Fact Types with Tags and Dimensions
    console.log('Step 4: Creating Fact Types...');
    const factTypesPayload = {
      fact_types: [
        {
          key: 'survey_phq9',
          name: 'PHQ-9',
          description: 'Patient Health Questionnaire 9 (PHQ-9) for assessing depression severity.',
          dimensionSchemas: [
            { key: 'phq9_q1_response', name: 'Little interest or pleasure in doing things', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q2_response', name: 'Feeling down, depressed, or hopeless', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q3_response', name: 'Trouble falling or staying asleep, or sleeping too much', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q4_response', name: 'Feeling tired or having little energy', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q5_response', name: 'Poor appetite or overeating', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q6_response', name: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q7_response', name: 'Trouble concentrating on things, such as reading the newspaper or watching television', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q8_response', name: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_q9_response', name: 'Thoughts that you would be better off dead or of hurting yourself in some way', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_assessment_score', name: 'Sum of responses', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'phq9_follow_up', name: 'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?', dataType: 'number', dataUnit: '', isRequired: false }
          ],
          tags: [surveyTag]
        },
        {
          key: 'survey_gad7',
          name: 'GAD-7',
          description: 'General Anxiety Disorder 7 (GAD-7) for assessing anxiety severity.',
          dimensionSchemas: [
            { key: 'gad7_q1_response', name: 'Feeling nervous, anxious, or on edge', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_q2_response', name: 'Not being able to stop or control worrying', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_q3_response', name: 'Worrying too much about different things', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_q4_response', name: 'Trouble relaxing', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_q5_response', name: "Being so restless that it's hard to sit still", dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_q6_response', name: 'Becoming easily annoyed or irritable', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_q7_response', name: 'Feeling afraid as if something awful might happen', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_assessment_score', name: 'Sum of responses', dataType: 'number', dataUnit: '', isRequired: true },
            { key: 'gad7_follow_up', name: 'How difficult have these problems made it to do work, take care of things at home, or get along with other people?', dataType: 'number', dataUnit: '', isRequired: false }
          ],
          tags: [surveyTag]
        },
        {
          key: 'survey_oks',
          name: 'Oxford Knee Score (OKS)',
          description: 'A survey for assessing knee function and pain severity.',
          dimensionSchemas: [
            { key: 'oks_left_q1_response', name: 'How would you describe the pain you usually have from your knee?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q2_response', name: 'Have you had any trouble with washing and drying yourself?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q3_response', name: 'Have you had any trouble getting in and out of a car?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q4_response', name: 'For how long have you been able to walk before the pain becomes severe?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q5_response', name: 'After a meal, how painful has it been to stand up from a chair?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q6_response', name: 'Have you been limping when walking?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q7_response', name: 'Could you kneel down and get up again afterwards?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q8_response', name: 'Have you been troubled by pain from your knee in bed at night?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q9_response', name: 'How much has pain from your knee interfered with your usual work?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q10_response', name: 'Have you felt that your knee might suddenly give way?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q11_response', name: 'Could you do the household shopping on your own?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_q12_response', name: 'Could you walk down a flight of stairs?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_left_assessment_score', name: 'Sum of responses', dataType: 'number', dataUnit: '', isRequired: false },
            // Repeat for the right knee
            { key: 'oks_right_q1_response', name: 'How would you describe the pain you usually have from your knee?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q2_response', name: 'Have you had any trouble with washing and drying yourself?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q3_response', name: 'Have you had any trouble getting in and out of a car?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q4_response', name: 'For how long have you been able to walk before the pain becomes severe?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q5_response', name: 'After a meal, how painful has it been to stand up from a chair?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q6_response', name: 'Have you been limping when walking?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q7_response', name: 'Could you kneel down and get up again afterwards?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q8_response', name: 'Have you been troubled by pain from your knee in bed at night?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q9_response', name: 'How much has pain from your knee interfered with your usual work?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q10_response', name: 'Have you felt that your knee might suddenly give way?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q11_response', name: 'Could you do the household shopping on your own?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_q12_response', name: 'Could you walk down a flight of stairs?', dataType: 'number', dataUnit: '', isRequired: false },
            { key: 'oks_right_assessment_score', name: 'Sum of responses', dataType: 'number', dataUnit: '', isRequired: false }
          ],
          tags: [surveyTag]
        }
        // Add more fact_types as needed
      ]
    };

    const factTypesResponse = await installConfig(factTypesPayload);
    const createdFactTypes = factTypesResponse.data.createdObjects?.fact_types || [];
    console.log('Created Fact Types:', createdFactTypes.length);
    console.log('-----------------------------------\n');

    console.log('Seed Data Installation Completed Successfully.\n');

  } catch (error: any) {
    console.error('Installation Failed:', error.message || error);
    process.exit(1);
  }
}

main();
