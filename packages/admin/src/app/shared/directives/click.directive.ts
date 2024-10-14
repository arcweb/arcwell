import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[click], [mat-dialog-close]',

  standalone: true,
})
export class ClickDirective implements OnChanges, OnInit {
  @Input() disabled?: boolean | null;
  @Input() disablePointer?: boolean;
  private el: ElementRef = inject(ElementRef);

  ngOnInit() {
    this.updateCursor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disablePointer'] || changes['disabled']) {
      this.updateCursor();
    }
  }

  private updateCursor(): void {
    if (!this.disablePointer) {
      this.el.nativeElement.style.userSelect = 'none';
      if (!this.disabled) {
        this.el.nativeElement.style.cursor = 'pointer';
      }
    }
  }
}
