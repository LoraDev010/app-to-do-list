import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { clipboardOutline, folderOpenOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  templateUrl: 'empty-state.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonText],
})
export class EmptyStateComponent {
  icon = input('clipboard-outline');
  title = input('Sin elementos');
  subtitle = input('');

  constructor() {
    addIcons({ clipboardOutline, folderOpenOutline });
  }
}
