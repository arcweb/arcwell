import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { ActivatedRoute } from '@angular/router';
import { register } from 'swiper/element';
import { FactService } from '@services/fact/fact.service';
import { AuthService } from '@services/auth/auth.service';
import { Phq9Component } from '@components/phq9/phq9.component';
import { HomeHeaderComponent } from '@components/home-header/home-header.component';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonHeader,
    IonTitle,
    IonToolbar,
    Phq9Component,
    HomeHeaderComponent,
  ]
})
export class SurveyPage implements OnInit {
  factTypeId!: string;
  factType?: FactType;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private factService: FactService,
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
}
