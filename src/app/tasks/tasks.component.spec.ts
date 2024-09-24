import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks.component'; 
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

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'addTask', 'deleteTask', 'updateTask', 'getDeletedTasks']);

    await TestBed.configureTestingModule({
      declarations: [TasksComponent],
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

    fixture = TestBed.createComponent(TasksComponent);
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

  it('should filter tasks by search query', () => {
    component.tasks = [
      { _id: '1', name: 'Task 1', isImportant: false, isCompleted: false, description: 'Task 1' },
      { _id: '2', name: 'Task 2', isImportant: false, isCompleted: false, description: 'Task 2' }
    ];
    component.searchQuery = 'Task 1';
    component.onSearch();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].name).toBe('Task 1');
  });

  it('should mark task as completed', () => {
    const mockTask = { _id: '1', name: 'Task 1', isCompleted: false };
    component.toggleTaskCompletion(mockTask);
    expect(mockTask.isCompleted).toBe(true); // Check updated state
    expect(taskService.updateTask).toHaveBeenCalledWith(mockTask._id, { isCompleted: true });
  });
  
  it('should toggle task importance', () => {
    const mockTask = { _id: '1', name: 'Task 1', isImportant: false, }; // Update to isImportant
    component.toggleImportant(mockTask);
    expect(mockTask.isImportant).toBe(true); // Check updated state
    expect(taskService.updateTask).toHaveBeenCalledWith(mockTask._id, { isImportant: true });
  });  

  it('should update a task and call the service', () => {
    const mockTask = { _id: '1', name: 'Old Task', isCompleted: false, isImportant: false, description: 'Old Task' };
    
    const mockTarget = { innerText: 'Updated Task' };
    const event = new Event('click') as any;
    Object.defineProperty(event, 'target', { value: mockTarget });

    spyOn(console, 'log'); 
    
    component.updateTask(mockTask, event);
    
    expect(taskService.updateTask).toHaveBeenCalledWith(mockTask._id, {
        name: 'Updated Task', 
        description: 'Updated Task', 
        isCompleted: mockTask.isCompleted,
        isImportant: mockTask.isImportant
    });
  });

});
