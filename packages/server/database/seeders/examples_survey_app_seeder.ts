import { BaseSeeder } from '@adonisjs/lucid/seeders'
import FactType from '#models/fact_type'
import PersonType from '#models/person_type'
import Role from '#models/role'
import User from '#models/user'
import { PersonFactory } from '#database/factories/person_factory'
import DimensionSchema from '#models/dimension_schema'
import Tag from '#models/tag'

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

    const dimensionSchemas: DimensionSchema[] = [
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
    ]

    await FactType.firstOrCreate(
      { key: 'survey_phq9' },
      {
        key: 'survey_phq9',
        name: 'PHQ-9 Survey',
        description: 'Patient Health Questionnaire 9 (PHQ-9) for assessing depression severity.',
        dimensionSchemas: dimensionSchemas
      }
    )

    // GAD-7 Survey FactType
    const gad7Schemas: DimensionSchema[] = [
      { key: 'gad7_q1_response', name: 'Feeling nervous, anxious, or on edge', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_q2_response', name: 'Not being able to stop or control worrying', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_q3_response', name: 'Worrying too much about different things', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_q4_response', name: 'Trouble relaxing', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_q5_response', name: 'Being so restless that it\'s hard to sit still', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_q6_response', name: 'Becoming easily annoyed or irritable', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_q7_response', name: 'Feeling afraid as if something awful might happen', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_assessment_score', name: 'Sum of responses', dataType: 'number', dataUnit: '', isRequired: true },
      { key: 'gad7_follow_up', name: 'How difficult have these problems made it to do work, take care of things at home, or get along with other people?', dataType: 'number', dataUnit: '', isRequired: true }
    ]

    await FactType.firstOrCreate(
      { key: 'survey_gad7' },
      {
        key: 'survey_gad7',
        name: 'GAD-7 Survey',
        description: 'General Anxiety Disorder 7 (GAD-7) for assessing anxiety severity.',
        dimensionSchemas: gad7Schemas
      }
    )

    console.log('SurveyAppSeeder has been run successfully with one patient user and PHQ-9 survey data.')
  }
}
