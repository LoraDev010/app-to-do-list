import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonCheckbox,
  IonLabel,
  IonBadge,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';

import { Task } from '../../../core/models/task.model';
import { CategoryService } from '../../../core/services/category.service';
import { RemoteConfigService } from '../../../core/services/remote-config.service';

@Component({
  selector: 'app-task-item',
  templateUrl: 'task-item.component.html',
  styleUrls: ['task-item.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonCheckbox,
    IonLabel,
    IonBadge,
    IonIcon,
  ],
})
export class TaskItemComponent {
  task = input.required<Task>();
  toggled = output<string>();
  edited = output<Task>();
  deleted = output<string>();

  protected categoryService = inject(CategoryService);
  protected remoteConfig = inject(RemoteConfigService);

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  readonly priorityLabels: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
}
