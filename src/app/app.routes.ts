import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/task-list/task-list.page').then(m => m.TaskListPage),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list.page').then(
            m => m.CategoryListPage
          ),
      },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    ],
  },
];
