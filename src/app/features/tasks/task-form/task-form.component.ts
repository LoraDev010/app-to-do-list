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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  ModalController,
} from '@ionic/angular/standalone';

import { Task } from '../../../core/models/task.model';
import { CategoryService } from '../../../core/services/category.service';
import { RemoteConfigService } from '../../../core/services/remote-config.service';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: 'task-form.component.html',
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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
  ],
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | undefined;

  protected categoryService = inject(CategoryService);
  protected remoteConfig = inject(RemoteConfigService);
  private taskService = inject(TaskService);
  private modalCtrl = inject(ModalController);

  readonly isSaving = signal(false);

  readonly priorities = [
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
  ];

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    categoryId: new FormControl<string | null>(null),
    priority: new FormControl<string | null>(null),
  });

  ngOnInit(): void {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        categoryId: this.task.categoryId,
        priority: this.task.priority,
      });
    }
  }

  get isEditing(): boolean {
    return !!this.task;
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const { title, categoryId, priority } = this.form.value;

    try {
      if (this.task) {
        await this.taskService.update(this.task.id, title!, categoryId ?? null, priority as any ?? null);
      } else {
        await this.taskService.add(title!, categoryId ?? null, priority as any ?? null);
      }
      await this.modalCtrl.dismiss(null, 'saved');
    } finally {
      this.isSaving.set(false);
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancelled');
  }
}
