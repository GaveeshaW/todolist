//importing necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../task.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-deletedtasks',
  templateUrl: './deletedtasks.component.html',
  styleUrl: './deletedtasks.component.css'
})

//defining DeletedTasksComponent module
export class DeletedtasksComponent {
  tasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  searchQuery: string = '';
  filteredTasks = [...this.tasks];

  deletedTasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  //dfining the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private taskService: TaskService, private cdr: ChangeDetectorRef) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });
    
    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');

    this.loadDeletedTasks();
  }
  //to load the deleted tasks from the local storage
  loadDeletedTasks(): void {
    this.taskService.getDeletedTasks().subscribe(
      (tasks) => {
        this.deletedTasks = tasks.map((task: any) => ({
          name: task.description,
          completed: task.isCompleted,
          important: task.isImportant
        }));
        this.filteredTasks = [...this.deletedTasks];
      },
      (error) => {
        console.error('Error loading deleted tasks:', error);
      }
    );
  }  
  //restore to main tasks the deleted task
  restoreTask(task: any): void {
    this.taskService.restoreTask(task._id).subscribe(
      () => {
        this.deletedTasks = this.deletedTasks.filter(t => t !== task);
        this.updateDeletedTasksStorage();
        this.restoreToMainTasks(task);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error restoring task:', error);
      }
    );
  }
  
  //update the deleted tasks on he local storage
  updateDeletedTasksStorage(): void {
    localStorage.setItem('deletedTasks', JSON.stringify(this.deletedTasks));
  }
  //restore the deleted task on the main tasks array and update on local storage
  restoreToMainTasks(task: any): void {
    const mainTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    mainTasks.unshift(task);
    localStorage.setItem('tasks', JSON.stringify(mainTasks));
  }

  onSearch(): void {
    if (this.searchQuery) {
      this.filteredTasks = this.tasks.filter(task =>
        task.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }
}
