import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import to mock HttpClient
import { TaskService } from '../task.service';
import { of, takeLast } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Task } from '../task.model';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'addTask', 'deleteTask', 'updateTask', 'getDeletedTasks']);

    await TestBed.configureTestingModule({
      declarations: [MainComponent],
      imports: [
        HttpClientTestingModule,
        MatIconModule,
        MatNavList,
        MatDivider,
        FormsModule,
        ReactiveFormsModule
      ], 
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {paramMap: of({ get: () => 'mock-task-id' })}
        },
        {
          provide: Router,
          useValue: {
            url: '/my-day',
            events: of({})
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;

    taskService.getTasks.and.returnValue(of([]));
    taskService.addTask.and.returnValue(of({ _id: '123', name: 'Task', description: 'New Task', isCompleted: false, isImportant: false }));
    taskService.updateTask.and.returnValue(of({}));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on component creation', () => {
    expect(component.signupForm).toBeDefined();
    expect(component.signupForm.controls['name']).toBeDefined();
    expect(component.signupForm.controls['email']).toBeDefined();
  });

  it('should load from the database', () => {
    component.loadTasksFromDB();
    expect(taskService.getTasks).toHaveBeenCalled();
    expect(component.tasks.length).toBe(0);
  });

  it('should add a task', () => {
    spyOn(window, 'prompt').and.returnValue('New Task');
    component.addTask();
    expect(taskService.addTask).toHaveBeenCalled();
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].name).toBe('New Task');
  });

  it('should filter tasks by search query', () => {
    component.tasks = [
      { _id: '1', name: 'Task 1' },
      { _id: '2', name: 'Task 2' }
    ];
    component.searchQuery = 'Task 1';
    component.onSearch();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].name).toBe('Task 1');
  });

  it('should mark task as completed', () => {
    const mockTask = { _id: '1', name: 'Task 1', completed: false };
    component.toggleTaskCompletion(mockTask);
    expect(mockTask.completed).toBe(true);
    expect(taskService.updateTask).toHaveBeenCalledWith(mockTask._id, { isCompleted: true });
  });

  it('should toggle task importance', () => {
    const mockTask = { _id: '1', name: 'Task 1', important: false };
    component.toggleImportant(mockTask);
    expect(mockTask.important).toBe(true);
    expect(taskService.updateTask).toHaveBeenCalledWith(mockTask._id, { isImportant: true });
  });

  it('should load deleted tasks', () => {
    taskService.getDeletedTasks.and.returnValue(of([{ _id: '1', description: 'Deleted task', isCompleted: false, isImportant: false }]));
    component.loadDeletedTasks();
    expect(taskService.getDeletedTasks).toHaveBeenCalled();
    expect(component.deletedTasks.length).toBe(1);
  });

  it('should restore a deleted task', () => {
    const mockDeletedTask = { _id: '1', name: 'Deleted Task', completed: false, important: false };
    component.deletedTasks = [mockDeletedTask];
    taskService.updateTask.and.returnValue(of(mockDeletedTask));

    component.restoreTask(0);
    expect(taskService.updateTask).toHaveBeenCalledWith(mockDeletedTask._id, jasmine.any(Object));
    expect(component.deletedTasks.length).toBe(0);
  });

  it('should delete a task', () => {
    component.tasks = [{ _id: '1', name: 'Task 1' }];
    taskService.deleteTask.and.returnValue(of(null));

    component.deleteTask('1', 0);
    expect(taskService.deleteTask).toHaveBeenCalledWith('1');
    expect(component.tasks.length).toBe(0);
  })
});
