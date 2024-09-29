import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { register, SwiperContainer } from 'swiper/element/bundle';

@Component({
  selector: 'app-phq9',
  templateUrl: './phq9.page.html',
  styleUrls: ['./phq9.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonListHeader,
    IonRadio,
    IonRadioGroup,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Phq9Page implements OnInit {
  factTypes: FactType[] = [];
  selectedFactType: FactType | null = null;

  answers: { [key: string]: number } = {};

  totalScore: number = 0;
  followUpResponse: number | null = null;
  allQuestionsAnswered: boolean = false;
  showScore: boolean = false;

  @ViewChild('swiperEl', { static: false }) swiperEl?: ElementRef<SwiperContainer>;

  constructor(private factTypeService: FactTypeService) {
    register();
  }

  ngOnInit(): void {
    this.loadFactTypes({ limit: 10, offset: 0 });
  }

  loadFactTypes(queryData: any): void {
    this.factTypeService.getFactTypes(queryData).subscribe({
      next: (response) => {
        this.factTypes = response.data;
        console.log('Fact types:', this.factTypes);
      },
      error: (error) => {
        console.error('Error fetching fact types:', error);
      },
    });
  }

  loadFactTypeById(id: string): void {
    this.factTypeService.getFactTypeById(id).subscribe({
      next: (response: any) => {
        this.selectedFactType = response.data;
        console.log('Selected fact type:', this.selectedFactType);
      },
      error: (error) => {
        console.error('Error fetching fact type:', error);
      },
    });
  }


  setAnswer(dimensionKey: string, value: number) {
    this.answers[dimensionKey] = Number(value);
    console.log(`Answer for dimension ${dimensionKey}: ${value}`);

    this.calculateScore();
    this.checkAllQuestionsAnswered();

    if (!this.showScore) {
      this.goToNext();
    }
  }

  calculateScore() {
    const questionKeys = Object.keys(this.answers)
      .filter(key => key.includes('response'));

    this.totalScore = questionKeys
      .reduce((acc, key) => acc + Number(this.answers[key] || 0), 0);

    this.answers['phq9_assessment_score'] = this.totalScore;

    console.log(this.answers);
  }

  checkAllQuestionsAnswered() {
    const totalQuestions = this.selectedFactType?.dimensionTypes
      .filter(dimension => dimension.key.includes('response')).length || 0;

    const answeredQuestions = Object.keys(this.answers)
      .filter(key => key.includes('response')).length;

    this.showScore = totalQuestions === answeredQuestions;
    console.log(`All questions answered: ${this.showScore}`);
  }

  followUpQuestionText(): string {
    return this.selectedFactType?.dimensionTypes.find(dimension => dimension.key === 'phq9_follow_up')?.name || '';
  }

  questionDimensionTypes() {
    return this.selectedFactType?.dimensionTypes.filter(dimension => dimension.key.includes('response')) || [];
  }

  saveQuestionnaire() {
    console.log('Saving questionnaire answers:', this.answers);
  }

  setFollowUpResponse(value: number) {
    this.answers['phq9_follow_up'] = Number(value);
    console.log(`Follow-up response: ${value}`);
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
