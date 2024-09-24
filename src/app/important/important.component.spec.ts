import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ImportantComponent } from './important.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import to mock HttpClient
import { TaskService } from '../task.service';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ImportantComponent', () => {
  let component: ImportantComponent;
  let fixture: ComponentFixture<ImportantComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'addTask', 'updateTask']);

    await TestBed.configureTestingModule({
      declarations: [ImportantComponent],
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

    fixture = TestBed.createComponent(ImportantComponent);
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

  it('should load important tasks on initialization', () => {
    taskService.getTasks.and.returnValue(of([{ _id: '1', description: 'Important Task', isCompleted: false, isImportant: true }]));
    component.loadImportantTasks();
    expect(component.importantTasks.length).toBe(1);
    expect(component.filteredTasks.length).toBe(1);
  });

  it('should update the main task list', () => {
    component.allTasks = [{ _id: '1', name: 'Old Task', completed: false, important: false }];
    const updatedTask = { _id: '1', name: 'Old Task', completed: true, important: false }; 
    component.updateMainTaskList(updatedTask);
    
    expect(component.allTasks[0].name).toBe('Old Task'); 
    expect(component.allTasks[0].completed).toBe(true);  
  });  

  it('should filter tasks correctly', () => {
    component.importantTasks = [
      { _id: '1', name: 'Task 1', important: true },
      { _id: '2', name: 'Task 2', important: true }
    ];
    component.filterTasks();
    expect(component.filteredTasks.length).toBe(2);
  });
  
  it('should toggle showing important tasks', () => {
    component.importantTasks = [
      { _id: '1', name: 'Task 1', important: true },
      { _id: '2', name: 'Task 2', important: true }
    ];
    component.showImportant = false;
    component.toggleImportantTasks();
    expect(component.showImportant).toBe(true);
    expect(component.filteredTasks.length).toBe(2); 
  });

  it('should filter tasks based on search query', () => {
    component.importantTasks = [
      { _id: '1', name: 'Task 1', important: true },
      { _id: '2', name: 'Task 2', important: true }
    ];
    component.searchQuery = 'Task 1';
    component.onSearch();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].name).toBe('Task 1');
  });
  
  it('should add a new task', fakeAsync(() => {
    spyOn(window, 'prompt').and.returnValue('New Task');
    component.addTask();
    tick();
    expect(component.allTasks.length).toBe(0);
    expect(taskService.addTask).toHaveBeenCalledWith(jasmine.any(Object));
  }));
});
