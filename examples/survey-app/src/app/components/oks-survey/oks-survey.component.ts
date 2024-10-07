import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonAlert, IonButton, IonCard, IonCardContent, IonChip, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
import { DimensionSchema, FactType } from '@services/fact-type/fact-type.service';
import { FactService, Fact } from '@services/fact/fact.service';
import { AuthService } from '@services/auth/auth.service';
import { switchMap } from 'rxjs';
import { SwiperContainer } from 'swiper/element';
import { SurveyConfig } from '@pages/surveys/configs';
import { ToastService } from '@services/toast/toast.service';

@Component({
  selector: 'app-oks-survey',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonAlert,
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
    IonRadio,
    IonRadioGroup,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './oks-survey.component.html',
  styleUrls: ['./oks-survey.component.scss'],
})
export class OksSurveyComponent {
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

  isAlertOpen = false;
  answers: { [key: string]: number } = {};
  sideSelected: 'left' | 'right' | 'both' | null = null;
  showSurvey: boolean = false;
  totalScoreLeft: number = 0;
  totalScoreRight: number = 0;
  showScore: boolean = false;

  constructor(
    private authService: AuthService,
    private factService: FactService,
    private toastService: ToastService,
  ) { }

  areAllQuestionsAnsweredForSide(side: 'left' | 'right'): boolean {
    const sideDimensions = this.questionDimensionSchemas(side);
    return sideDimensions.every(dimension => this.answers[dimension.key] !== undefined);
  }

  calculateScore(side: 'left' | 'right'): number {
    const questionKeys = Object.keys(this.answers).filter(key => key.includes(`${side}`) && key.includes('response'));
    const totalScore = questionKeys.reduce((acc, key) => acc + Number(this.answers[key] || 0), 0);

    if (side === 'left') {
      this.totalScoreLeft = totalScore;
    } else {
      this.totalScoreRight = totalScore;
    }

    const scoreSchema = this.factType?.dimensionSchemas.find(dimension => dimension.key.includes(`${side}`) && dimension.key.includes('assessment_score'));

    if (scoreSchema) {
      this.answers[scoreSchema.key] = totalScore;
    }

    return totalScore;
  }

  checkAllQuestionsAnswered() {
    const leftSideAnswered = this.areAllQuestionsAnsweredForSide('left');
    const rightSideAnswered = this.areAllQuestionsAnsweredForSide('right');

    let allAnswered = false;
    if (this.sideSelected === 'left') {
      allAnswered = leftSideAnswered;
    } else if (this.sideSelected === 'right') {
      allAnswered = rightSideAnswered;
    } else if (this.sideSelected === 'both') {
      allAnswered = leftSideAnswered && rightSideAnswered;
    }

    this.showScore = allAnswered;
  }

  getRadioLabels(dimensionKey?: string): { label: string; value: number }[] {
    if (!dimensionKey) {
      return this.surveyConfig.radioLabels;
    }

    const keyWithSideRemoved = dimensionKey.replace('left_', '').replace('right_', '');
    return this.surveyConfig.questionSpecificLabels?.[keyWithSideRemoved] || this.surveyConfig.radioLabels;
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

  questionDimensionSchemas(side: 'left' | 'right'): DimensionSchema[] {
    return this.factType?.dimensionSchemas.filter(dimension => dimension.key.includes(`${side}`) && dimension.key.includes('response')) || [];
  }

  saveAllowed(): boolean {
    if (this.sideSelected === 'left') {
      return this.areAllQuestionsAnsweredForSide('left');
    } else if (this.sideSelected === 'right') {
      return this.areAllQuestionsAnsweredForSide('right');
    } else if (this.sideSelected === 'both') {
      return this.areAllQuestionsAnsweredForSide('left') && this.areAllQuestionsAnsweredForSide('right');
    }

    return false;
  }

  setAnswer(dimensionKey: string, value: number): void {
    this.answers[dimensionKey] = value;
    this.calculateScore(dimensionKey.includes('left') ? 'left' : 'right');
    this.checkAllQuestionsAnswered();
    this.goToNext();
  }

  startSurvey(): void {
    this.showSurvey = true;
  }

  async saveQuestionnaire() {
    if (this.factType) {
      const fact: Fact = {
        typeKey: this.factType.key,
        observed_at: new Date().toISOString(),
        dimensions: Object.keys(this.answers).map(key => ({
          key,
          value: this.answers[key]
        }))
      };

      this.authService.currentUser().pipe(
        switchMap((response: any) => {
          fact.personId = response.data.personId;
          return this.factService.saveFact(fact);
        })
      ).subscribe({
        next: (response) => {
          console.log('Questionnaire saved:', response);
        },
        error: (error) => {
          console.error('Error saving OKS survey:', error);
        },
        complete: () => {
          this.toastService.presentToast(
            'bottom',
            'Questionnaire saved',
            3000,
            'success'
          );
          this.resetAction.emit();
        }
      });
    }
  }
}
