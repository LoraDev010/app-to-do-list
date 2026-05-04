import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';
import { TaskService } from './task.service';
import { StorageService } from './storage.service';

describe('TaskService', () => {
  let service: TaskService;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let toastSpy: jasmine.SpyObj<ToastController>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);
    storageSpy.get.and.returnValue(Promise.resolve(null));
    storageSpy.set.and.returnValue(Promise.resolve());

    toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastSpy.create.and.returnValue(Promise.resolve({ present: () => Promise.resolve() } as any));

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: StorageService, useValue: storageSpy },
        { provide: ToastController, useValue: toastSpy },
      ],
    });

    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add task to the beginning of the list', async () => {
    await service.add('Primera tarea', null, null);
    await service.add('Segunda tarea', null, null);

    expect(service.tasks()[0].title).toBe('Segunda tarea');
    expect(service.tasks()[1].title).toBe('Primera tarea');
  });

  it('should generate unique id for each task', async () => {
    await service.add('Tarea A', null, null);
    await service.add('Tarea B', null, null);

    const ids = service.tasks().map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should mark task as completed on toggle', async () => {
    await service.add('Tarea', null, null);
    const id = service.tasks()[0].id;

    await service.toggle(id);

    expect(service.tasks()[0].completed).toBeTrue();
  });

  it('should mark task as pending on second toggle', async () => {
    await service.add('Tarea', null, null);
    const id = service.tasks()[0].id;

    await service.toggle(id);
    await service.toggle(id);

    expect(service.tasks()[0].completed).toBeFalse();
  });

  it('should update task title', async () => {
    await service.add('Título original', null, null);
    const id = service.tasks()[0].id;

    await service.update(id, 'Título actualizado', null, null);

    expect(service.tasks()[0].title).toBe('Título actualizado');
  });

  it('should remove task by id', async () => {
    await service.add('Tarea a eliminar', null, null);
    const id = service.tasks()[0].id;

    await service.remove(id);

    expect(service.tasks().length).toBe(0);
  });

  it('should filter tasks by category', async () => {
    await service.add('Sin categoría', null, null);
    await service.add('Con categoría', 'cat-1', null);

    service.setFilter('cat-1');

    expect(service.filteredTasks().length).toBe(1);
    expect(service.filteredTasks()[0].categoryId).toBe('cat-1');
  });

  it('should count only pending tasks', async () => {
    await service.add('Tarea 1', null, null);
    await service.add('Tarea 2', null, null);
    const id = service.tasks()[0].id;

    await service.toggle(id);

    expect(service.pendingCount()).toBe(1);
  });

  it('should clear category from tasks when category is deleted', async () => {
    await service.add('Tarea con categoría', 'cat-1', null);
    const id = service.tasks()[0].id;

    service.clearCategoryFromTasks('cat-1');

    expect(service.tasks().find(t => t.id === id)?.categoryId).toBeNull();
  });

  it('should persist to storage on add', async () => {
    await service.add('Tarea', null, null);

    expect(storageSpy.set).toHaveBeenCalled();
  });
});
