import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonAlert, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonHeader, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { DimensionSchema } from '@models/dimension-schema';
import { Fact } from '@models/fact';
import { FactType } from '@models/fact-type';
import { SurveyConfig } from '@configs/survey-configs';
import { AuthService } from '@services/auth.service';
import { FactService } from '@services/fact.service';
import { ToastService } from '@services/toast.service';
import { switchMap } from 'rxjs';
import { SwiperContainer } from 'swiper/element';
import { ChartComponent } from '@components/chart/chart.component';
import { ChartService } from '@services/chart.service';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-generic-survey',
  standalone: true,
  imports: [
    CommonModule,
    ChartComponent,
    FormsModule,
    IonAlert,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonContent,
    IonHeader,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './generic-survey.component.html',
  styleUrls: ['./generic-survey.component.scss'],
})
export class GenericSurveyComponent {
  @ViewChild('swiperEl', { static: false }) swiperEl?: ElementRef<SwiperContainer>;

  @Input('factType') factType?: FactType;
  @Input('surveyConfig') surveyConfig!: SurveyConfig;

  @Output('resetAction') resetAction: EventEmitter<void> = new EventEmitter<void>();

  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        this.isAlertOpen = false;
      },
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.isAlertOpen = false;
        this.resetAction.emit();
      },
    },
  ];

  allQuestionsAnswered: boolean = false;
  isAlertOpen = false;
  showFollowUp: boolean = false;
  showResults: boolean = false;

  answers: { [key: string]: number } = {};
  totalScore: number = 0;
  chartOptions?: EChartsOption;

  constructor(
    private authService: AuthService,
    public chartService: ChartService,
    private factService: FactService,
    private toastService: ToastService,
  ) { }

  calculateScore(): number {
    const questionKeys = Object.keys(this.answers).filter(key => key.includes('response'));
    this.totalScore = questionKeys.reduce((acc, key) => acc + Number(this.answers[key] || 0), 0);
    const scoreSchema = this.factType?.dimensionSchemas.find(dimension => dimension.key.includes('assessment_score'));

    if (scoreSchema) {
      this.answers[scoreSchema.key] = this.totalScore;
    }

    return this.totalScore;
  }

  checkAllQuestionsAnswered() {
    const totalQuestions = this.factType?.dimensionSchemas.filter(dimension => dimension.key.includes('response')).length || 0;
    const answeredQuestions = Object.keys(this.answers).filter(key => key.includes('response')).length;
    this.showFollowUp = totalQuestions === answeredQuestions;
  }

  followUpQuestion(): DimensionSchema | undefined {
    return this.factType?.dimensionSchemas.find(dimension => dimension.key.includes('follow_up'));
  }

  getAssessment() {
    if (this.totalScore <= 4) return 'No Anxiety Disorder';
    if (this.totalScore <= 9) return 'Mild Anxiety Disorder';
    return 'Severe Anxiety Disorder';
  }

  getRadioLabels(dimensionKey?: string): { label: string; value: number }[] {
    if (!dimensionKey) {
      return this.surveyConfig.radioLabels;
    }

    return this.surveyConfig.questionSpecificLabels?.[dimensionKey] || this.surveyConfig.radioLabels;
  }

  goToPrevious() {
    if (this.swiperEl?.nativeElement?.swiper) {
      this.swiperEl.nativeElement.swiper.slidePrev();
    }
  }

  goToNext() {
    if (this.swiperEl?.nativeElement?.swiper) {
      this.swiperEl.nativeElement.swiper.slideNext();
    }
  }

  openAlert() {
    this.isAlertOpen = true;
  }

  questionDimensionSchemas() {
    return this.factType?.dimensionSchemas.filter(dimension => dimension.key.includes('response')) || [];
  }

  saveAllowed(): boolean {
    if (this.totalScore > 0) {
      const followUpQuestion = this.followUpQuestion();
      const followUpAnswered = followUpQuestion ? this.answers[followUpQuestion.key] !== undefined : true;
      return this.allQuestionsAnswered && followUpAnswered;
    } else {
      return this.allQuestionsAnswered;
    }
  }

  setAnswer(dimensionKey: string, value: number) {
    this.answers[dimensionKey] = Number(value);
    this.calculateScore();
    this.checkAllQuestionsAnswered();
    // this.goToNext();
  }

  setFollowUpResponse(value: number) {
    const followUpQuestion = this.followUpQuestion();
    if (followUpQuestion) {
      this.answers[followUpQuestion.key] = Number(value);
    }
  }

  async saveQuestionnaire() {
    if (this.factType) {
      const fact: Fact = {
        typeKey: this.factType.key,
        observedAt: new Date().toISOString(),
        dimensions: Object.keys(this.answers).map(key => ({
          key,
          value: this.answers[key]
        })),
      };

      this.authService.currentUser().pipe(
        switchMap((response: any) => {
          fact.personId = response.data.personId;
          return this.factService.saveFact(fact);
        }),
        switchMap(() => this.chartService.getChartOption(this.factType!))
      ).subscribe({
        next: (chartOptions) => {
          this.chartOptions = chartOptions;
        },
        error: (error) => {
          console.error('Error saving questionnaire:', error);
        },
        complete: () => {
          this.toastService.presentToast(
            'bottom',
            'Questionnaire saved',
            3000,
            'success'
          );
          this.showResults = true;
        }
      });
    }
  }
}
