import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannedComponent } from './planned.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { TaskService } from '../task.service';
import { of, takeLast } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { throwError } from 'rxjs';

describe('PlannedComponent', () => {
  let component: PlannedComponent;
  let fixture: ComponentFixture<PlannedComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'addTask', 'deleteTask', 'updateTask', 'getDeletedTasks']);

    await TestBed.configureTestingModule({
      declarations: [PlannedComponent],
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

    fixture = TestBed.createComponent(PlannedComponent);
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

  it('should toggle task importance', () => {
    component.isImportant = false;
    component.toggleStar();
    expect(component.isImportant).toBe(true);
  });

  it('should clear the form after adding a task', () => {
    spyOn(window, 'prompt').and.returnValue('New Task');
    component.addTask();
    expect(component.toDoForm.value.task).toBe('');
    expect(component.isImportant).toBe(false);
  });

  it('should not add a task if the task name is empty', () => {
    component.toDoForm.controls['task'].setValue('');
    component.addTask();
    expect(taskService.addTask).not.toHaveBeenCalled();
    expect(component.tasks.length).toBe(0);
  });

  it('should add a task', () => {
    const taskToAdd = { _id: '123', name: 'New Task', description: 'New Task', isCompleted: false, isImportant: false };
    taskService.addTask.and.returnValue(of(taskToAdd));

    spyOn(window, 'prompt').and.returnValue('New Task');
    component.toDoForm.controls['task'].setValue('New Task');
    component.addTask();
    expect(taskService.addTask).toHaveBeenCalled(); 
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].name).toBe('New Task'); 
    expect(component.tasks[0].completed).toBe(false); 
    expect(component.tasks[0].important).toBe(false); 
  });
});
