import { BaseSeeder } from '@adonisjs/lucid/seeders'
import FactType from '#models/fact_type'
import PersonType from '#models/person_type'
import Role from '#models/role'
import User from '#models/user'
import { PersonFactory } from '#database/factories/person_factory'
import DimensionSchema from '#models/dimension_schema'
import Tag from '#models/tag'
import db from '@adonisjs/lucid/services/db'

export default class SurveyAppSeeder extends BaseSeeder {
  static environment = ['development']

  async addTagToFactType(factTypeId: string, tagId: string) {
    await db.rawQuery(
      `INSERT INTO public.tag_object
        (id, tag_id, object_id, object_type, created_at, updated_at)
        VALUES(gen_random_uuid(), :tagId, :objectId, :objectType, now(), now());`,
      {
        tagId,
        objectId: factTypeId,
        objectType: 'fact_types',
      }
    )
  }

  async run() {
    const surveyUserType = await PersonType.firstOrCreate(
      { key: 'survey-user' },
      { key: 'survey-user', name: 'Survey User' }
    )

    const surveyUserRole = await Role.firstOrCreate({ name: 'Survey User' }, { name: 'Survey User' })

    const surveyUser = await PersonFactory.merge({
      typeKey: surveyUserType.key,
    }).create()

    await User.firstOrCreate(
      { email: 'patient@example.com' },
      {
        email: 'patient@example.com',
        password: 'password',
        personId: surveyUser.id,
        roleId: surveyUserRole.id,
      }
    )

    const surveyTag = await Tag.firstOrCreate({ pathname: 'survey' }, { pathname: 'survey' })

    const dimensionSchemas: DimensionSchema[] = [
      {
        key: 'phq9_q1_response',
        name: 'Little interest or pleasure in doing things',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q2_response',
        name: 'Feeling down, depressed, or hopeless',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q3_response',
        name: 'Trouble falling or staying asleep, or sleeping too much',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q4_response',
        name: 'Feeling tired or having little energy',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q5_response',
        name: 'Poor appetite or overeating',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q6_response',
        name: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q7_response',
        name: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q8_response',
        name: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_q9_response',
        name: 'Thoughts that you would be better off dead or of hurting yourself in some way',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_assessment_score',
        name: 'Sum of responses',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'phq9_follow_up',
        name: 'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?',
        dataType: 'number',
        dataUnit: '',
        isRequired: false,
      },
    ]

    const phq9FactType = await FactType.firstOrCreate(
      { key: 'survey_phq9' },
      {
        key: 'survey_phq9',
        name: 'PHQ-9',
        description: 'Patient Health Questionnaire 9 (PHQ-9) for assessing depression severity.',
        dimensionSchemas: dimensionSchemas,
      }
    )

    await this.addTagToFactType(phq9FactType.id, surveyTag.id)

    const gad7Schemas: DimensionSchema[] = [
      {
        key: 'gad7_q1_response',
        name: 'Feeling nervous, anxious, or on edge',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_q2_response',
        name: 'Not being able to stop or control worrying',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_q3_response',
        name: 'Worrying too much about different things',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_q4_response',
        name: 'Trouble relaxing',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_q5_response',
        name: "Being so restless that it's hard to sit still",
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_q6_response',
        name: 'Becoming easily annoyed or irritable',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_q7_response',
        name: 'Feeling afraid as if something awful might happen',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_assessment_score',
        name: 'Sum of responses',
        dataType: 'number',
        dataUnit: '',
        isRequired: true,
      },
      {
        key: 'gad7_follow_up',
        name: 'How difficult have these problems made it to do work, take care of things at home, or get along with other people?',
        dataType: 'number',
        dataUnit: '',
        isRequired: false,
      },
    ]

    const gad7FactType = await FactType.firstOrCreate(
      { key: 'survey_gad7' },
      {
        key: 'survey_gad7',
        name: 'GAD-7',
        description: 'General Anxiety Disorder 7 (GAD-7) for assessing anxiety severity.',
        dimensionSchemas: gad7Schemas,
      }
    )

    await this.addTagToFactType(gad7FactType.id, surveyTag.id)

    const oksQuestions = [
      {
        key: 'q1_response',
        name: 'How would you describe the pain you usually have from your knee?',
      },
      {
        key: 'q2_response',
        name: 'Have you had any trouble with washing and drying yourself?',
      },
      {
        key: 'q3_response',
        name: 'Have you had any trouble getting in and out of a car?',
      },
      {
        key: 'q4_response',
        name: 'For how long have you been able to walk before the pain becomes severe?',
      },
      {
        key: 'q5_response',
        name: 'After a meal, how painful has it been to stand up from a chair?',
      },
      { key: 'q6_response', name: 'Have you been limping when walking?' },
      {
        key: 'q7_response',
        name: 'Could you kneel down and get up again afterwards?',
      },
      {
        key: 'q8_response',
        name: 'Have you been troubled by pain from your knee in bed at night?',
      },
      {
        key: 'q9_response',
        name: 'How much has pain from your knee interfered with your usual work?',
      },
      {
        key: 'q10_response',
        name: 'Have you felt that your knee might suddenly give way?',
      },
      {
        key: 'q11_response',
        name: 'Could you do the household shopping on your own?',
      },
      { key: 'q12_response', name: 'Could you walk down a flight of stairs?' },
      { key: 'assessment_score', name: 'Sum of responses' },
    ]

    // Create dimension schemas for left and right knees
    const createDimensionsForSide = (side: 'left' | 'right') => {
      return oksQuestions.map((question) => {
        return {
          key: `oks_${side}_${question.key}`,
          name: `${question.name}`,
          dataType: 'number',
          dataUnit: '',
          isRequired: false,
        }
      })
    }

    const oksSchemas = [...createDimensionsForSide('left'), ...createDimensionsForSide('right')]

    const oksFactType = await FactType.firstOrCreate(
      { key: 'survey_oks' },
      {
        key: 'survey_oks',
        name: 'Oxford Knee Score (OKS)',
        description: 'A survey for assessing knee function and pain severity.',
        dimensionSchemas: oksSchemas,
      }
    )

    await this.addTagToFactType(oksFactType.id, surveyTag.id)

    console.log('SurveyAppSeeder has been run successfully.')
  }
}
