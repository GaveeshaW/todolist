import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule
import { DeletedtasksComponent } from './deletedtasks.component';
import { MatIcon } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../task.service';

describe('DeletedtasksComponent', () => {
  let component: DeletedtasksComponent;
  let fixture: ComponentFixture<DeletedtasksComponent>;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatIcon,
        MatNavList,
        MatDivider,
        FormsModule
      ], 
      declarations: [DeletedtasksComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            snapshot: { params: {} },
          },
        },
        TaskService
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedtasksComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load deleted tasks from database', () => {
    const getDeletedTasksSpy = spyOn(taskService, 'getDeletedTasks').and.returnValue(of([]));
    component.loadDeletedTasks();
    expect(getDeletedTasksSpy).toHaveBeenCalled();
    expect(component.tasks.length).toBe(0);
  });

  it('should restore deleted tasks back', () => {
    const mockTask = { _id: '123', title: 'Test Task', name: 'Test Task' };
    const restoreTaskSpy = spyOn(taskService, 'restoreTask').and.returnValue(of([]));
    component.deletedTasks = [mockTask];
  
    component.restoreTask(mockTask);
    expect(restoreTaskSpy).toHaveBeenCalledWith('123');
  
    expect(component.deletedTasks).not.toContain(mockTask);
    const mainTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  
    const restoredTask = { title: 'Test Task', name: 'Test Task' };
    expect(mainTasks).toContain(jasmine.objectContaining(restoredTask));
  });  

  it('should update deleted tasks to storage', () => {
    const mockDeletedTasks = [
      { _id: '123', name: 'Task 1', completed: false },
      { _id: '124', name: 'Task 2', completed: true }
    ];
  
    const localStorageSpy = spyOn(localStorage, 'setItem');
    component.deletedTasks = mockDeletedTasks;
    component.updateDeletedTasksStorage();
    expect(localStorageSpy).toHaveBeenCalledWith(
      'deletedTasks', 
      JSON.stringify(mockDeletedTasks)
    );
  });  

  it('should restore the tasks to the main', () => {
    const mockTask = { _id: '123', name: 'Test Task', completed: false };
    const existingTasks = [
      { _id: '456', name: 'Existing Task 1', completed: false },
      { _id: '789', name: 'Existing Task 2', completed: true }
    ];

    localStorage.setItem('tasks', JSON.stringify(existingTasks));

    const localStorageGetSpy = spyOn(localStorage, 'getItem').and.callThrough();
    const localStorageSetSpy = spyOn(localStorage, 'setItem');

    component.restoreToMainTasks(mockTask);

    expect(localStorageGetSpy).toHaveBeenCalledWith('tasks');
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'tasks',
      JSON.stringify([mockTask, ...existingTasks])
    );
    expect(mockTask._id).toBeUndefined();
  });

  it('should load and display filtered tasks on search', () => {
    component.tasks = [
      { _id: 'Task 1', name: 'Task 1' },
      { _id: 'Task 2', name: 'Task 2' }
    ];
    component.searchQuery = 'Task 1';
    component.onSearch();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].name).toBe('Task 1');
  });
});
