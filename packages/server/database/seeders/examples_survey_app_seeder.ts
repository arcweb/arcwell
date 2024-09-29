import { BaseSeeder } from '@adonisjs/lucid/seeders'

import DimensionType from '#models/dimension_type'
import FactType from '#models/fact_type'
import PersonType from '#models/person_type'
import Role from '#models/role'
import User from '#models/user'

import { PersonFactory } from '#database/factories/person_factory'

export default class SurveyAppSeeder extends BaseSeeder {
  static environment = ['development']

  public async run() {
    const patientPersonType = await PersonType.firstOrCreate(
      { key: 'patient' },
      { key: 'patient', name: 'Patient' }
    )

    const patientRole = await Role.firstOrCreate(
      { name: 'patient' },
      { name: 'patient' }
    )

    const patientPerson = await PersonFactory.merge({ typeKey: patientPersonType.key }).create()

    await User.firstOrCreate(
      { email: 'patient@example.com' },
      {
        email: 'patient@example.com',
        password: 'password',
        personId: patientPerson.id,
        roleId: patientRole.id,
      }
    )

    const factType = await FactType.firstOrCreate(
      { key: 'survey_phq9' },
      {
        key: 'survey_phq9',
        name: 'PHQ-9 Survey',
        description: 'Patient Health Questionnaire 9 (PHQ-9) for assessing depression severity.',
      }
    )

    const questions = [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead or of hurting yourself in some way',
    ]

    const dimensionTypes: DimensionType[] = []

    for (let i = 0; i < questions.length; i++) {
      const questionText = questions[i]
      const dimensionType = await DimensionType.firstOrCreate(
        { key: `phq9_q${i + 1}_response` },
        {
          key: `phq9_q${i + 1}_response`,
          name: questionText,
          dataType: 'number',
          dataUnit: '',
        }
      )
      dimensionTypes.push(dimensionType)
    }

    const assessmentScore = await DimensionType.firstOrCreate(
      { key: 'phq9_assessment_score' },
      {
        key: 'phq9_assessment_score',
        name: 'Sum of responses',
        dataType: 'number',
        dataUnit: '',
      }
    )
    dimensionTypes.push(assessmentScore)

    const followUpResponse = await DimensionType.firstOrCreate(
      { key: 'phq9_follow_up' },
      {
        key: 'phq9_follow_up',
        name: 'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?',
        dataType: 'number', // Response will be a number (0 - 3)
        dataUnit: '',
      }
    )
    dimensionTypes.push(followUpResponse)

    // Update the fact type to include all dimension types as JSONB array
    factType.merge({ dimensionTypes: dimensionTypes.map((d) => d.toJSON()) as DimensionType[] })
    await factType.save()

    console.log('SurveyAppSeeder has been run successfully with one patient user and PHQ-9 survey data.')
  }
}
