import { ChangeDetectionStrategy, Component, Input, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  ModalController,
} from '@ionic/angular/standalone';

import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
];

@Component({
  selector: 'app-category-form',
  templateUrl: 'category-form.component.html',
  styleUrls: ['category-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
  ],
})
export class CategoryFormComponent implements OnInit {
  @Input() category: Category | undefined;

  protected categoryService = inject(CategoryService);
  private modalCtrl = inject(ModalController);

  readonly presetColors = PRESET_COLORS;
  selectedColor = signal(PRESET_COLORS[0]);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  ngOnInit(): void {
    if (this.category) {
      this.form.patchValue({ name: this.category.name });
      this.selectedColor.set(this.category.color);
    }
  }

  get isEditing(): boolean {
    return !!this.category;
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const name = this.form.value.name!;
    const color = this.selectedColor();

    if (this.category) {
      await this.categoryService.update(this.category.id, name, color);
    } else {
      await this.categoryService.add(name, color);
    }

    await this.modalCtrl.dismiss(null, 'saved');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancelled');
  }
}
