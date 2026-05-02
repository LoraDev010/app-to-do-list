import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonBadge,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { addIcons } from 'ionicons';
import { add, filterOutline, checkmarkCircle } from 'ionicons/icons';

import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { Task } from '../../../core/models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-task-list',
  templateUrl: 'task-list.page.html',
  styleUrls: ['task-list.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonBadge,
    ScrollingModule,
    TaskItemComponent,
    EmptyStateComponent,
  ],
})
export class TaskListPage {
  protected taskService = inject(TaskService);
  protected categoryService = inject(CategoryService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ add, filterOutline, checkmarkCircle });
  }

  trackByTask(_: number, task: Task): string {
    return task.id;
  }

  setFilter(categoryId: string | null): void {
    this.taskService.setFilter(categoryId);
  }

  async openTaskForm(task?: Task): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      componentProps: { task },
      breakpoints: [0, 0.6, 0.9],
      initialBreakpoint: 0.6,
    });
    await modal.present();
  }

  async confirmDelete(taskId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: '¿Estás seguro de que quieres eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.taskService.remove(taskId),
        },
      ],
    });
    await alert.present();
  }
}
