import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonFab,
  IonFabButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, folderOpenOutline } from 'ionicons/icons';

import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-category-list',
  templateUrl: 'category-list.page.html',
  styleUrls: ['category-list.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonFab,
    IonFabButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    EmptyStateComponent,
  ],
})
export class CategoryListPage {
  protected categoryService = inject(CategoryService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ add, createOutline, trashOutline, folderOpenOutline });
  }

  trackByCategory(_: number, cat: Category): string {
    return cat.id;
  }

  async openCategoryForm(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormComponent,
      componentProps: { category },
      breakpoints: [0, 0.5, 0.75],
      initialBreakpoint: 0.5,
    });
    await modal.present();
  }

  async confirmDelete(catId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: 'Las tareas de esta categoría quedarán sin categoría asignada.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.categoryService.remove(catId),
        },
      ],
    });
    await alert.present();
  }
}
