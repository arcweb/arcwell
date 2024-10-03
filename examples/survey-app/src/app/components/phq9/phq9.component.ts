import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
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
  IonToolbar
} from '@ionic/angular/standalone';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperContainer, register } from 'swiper/element';
import { Fact, FactService } from '@services/fact/fact.service';
import { AuthService } from '@services/auth/auth.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-phq9',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './phq9.component.html',
  styleUrls: ['./phq9.component.scss'],
})
export class Phq9Component {
  @ViewChild('swiperEl', { static: false }) swiperEl?: ElementRef<SwiperContainer>;
  @Input('factType') factType?: FactType;

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
        this.router.navigate(['/surveys']);
      },
    },
  ];

  isAlertOpen = false;

  answers: { [key: string]: number } = {};

  totalScore: number = 0;
  followUpResponse: number | null = null;
  allQuestionsAnswered: boolean = false;
  showScore: boolean = false;

  constructor(
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private factService: FactService,
    private factTypeService: FactTypeService
  ) {
    register();
    console.log('Phq9Component initialized');
  }

  calculateScore() {
    const questionKeys = Object.keys(this.answers)
      .filter(key => key.includes('response'));

    this.totalScore = questionKeys
      .reduce((acc, key) => acc + Number(this.answers[key] || 0), 0);

    this.answers['phq9_assessment_score'] = this.totalScore;
  }

  checkAllQuestionsAnswered() {
    const totalQuestions = this.factType?.dimensionSchemas
      .filter(dimension => dimension.key.includes('response')).length || 0;

    const answeredQuestions = Object.keys(this.answers)
      .filter(key => key.includes('response')).length;

    this.showScore = totalQuestions === answeredQuestions;
  }

  setAnswer(dimensionKey: string, value: number) {
    this.answers[dimensionKey] = Number(value);

    this.calculateScore();
    this.checkAllQuestionsAnswered();
    this.goToNext();
  }

  followUpQuestionText(): string {
    return this.factType?.dimensionSchemas.find(dimension => dimension.key === 'phq9_follow_up')?.name || '';
  }

  questionDimensionSchemas() {
    return this.factType?.dimensionSchemas.filter(dimension => dimension.key.includes('response')) || [];
  }

  openAlert() {
    this.isAlertOpen = true;
  }

  saveAllowed(): boolean {
    if (this.totalScore > 0) {
      const followUpAnswered = this.answers['phq9_follow_up'] !== undefined;

      return this.allQuestionsAnswered && followUpAnswered;
    } else {
      return this.allQuestionsAnswered;
    }
  }

  async saveQuestionnaire() {
    if (this.factType) {
      const fact: Fact = {
        typeKey: this.factType.key,
        dimensions: Object.keys(this.answers).map(key => ({
          key,
          value: this.answers[key]
        })),
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
          console.error('Error saving questionnaire:', error);
        },
      });
    }
  }

  setFollowUpResponse(value: number) {
    this.answers['phq9_follow_up'] = Number(value);
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
}
