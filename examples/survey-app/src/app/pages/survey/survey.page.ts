import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { ActivatedRoute } from '@angular/router';
import { SwiperContainer, register } from 'swiper/element';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar,
  ]
})
export class SurveyPage implements OnInit {
  @ViewChild('swiperEl', { static: false }) swiperEl?: ElementRef<SwiperContainer>;

  factTypeId!: string;
  factType: FactType | null = null;

  answers: { [key: string]: number } = {};

  totalScore: number = 0;
  followUpResponse: number | null = null;
  allQuestionsAnswered: boolean = false;
  showScore: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private factTypeService: FactTypeService
  ) {
    register();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.factTypeId = params.get('factTypeId') || '';
      this.getFactType();
    });
  }

  getFactType(): void {
    this.factTypeService.getFactTypeById(this.factTypeId).subscribe({
      next: (response: any) => {
        this.factType = response.data[0];
        console.log('Fact type:', this.factType);
      },
      error: (error) => {
        console.error('Error fetching fact type:', error);
      },
    });
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

  saveQuestionnaire() {
    console.log('Saving questionnaire answers:', this.answers);
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
