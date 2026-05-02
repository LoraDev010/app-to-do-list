import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
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
  category = input<Category | undefined>(undefined);

  protected categoryService = inject(CategoryService);
  private modalCtrl = inject(ModalController);

  readonly presetColors = PRESET_COLORS;
  selectedColor = signal(PRESET_COLORS[0]);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  ngOnInit(): void {
    const cat = this.category();
    if (cat) {
      this.form.patchValue({ name: cat.name });
      this.selectedColor.set(cat.color);
    }
  }

  get isEditing(): boolean {
    return !!this.category();
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;

    const name = this.form.value.name!;
    const color = this.selectedColor();
    const cat = this.category();

    if (cat) {
      await this.categoryService.update(cat.id, name, color);
    } else {
      await this.categoryService.add(name, color);
    }

    await this.modalCtrl.dismiss(null, 'saved');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancelled');
  }
}
