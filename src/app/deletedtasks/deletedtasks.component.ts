import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-deletedtasks',
  templateUrl: './deletedtasks.component.html',
  styleUrls: ['./deletedtasks.component.css']
})
export class DeletedtasksComponent implements OnInit {
  tasks: { _id: string; name: string; completed?: boolean; important?: boolean }[] = [];
  signupForm: FormGroup; //FormGroup for user input
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  searchQuery: string = '';
  filteredTasks = [...this.tasks];

  deletedTasks: { _id: string; name: string; completed?: boolean; important?: boolean }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef //used to manually trigger change detection
  ) {
    //initializing the signup form with validators
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    //track and update the active route when it changes
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });

    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');

    this.loadDeletedTasks();
  }
  //load deleted tasks from the service and map the task data
  loadDeletedTasks(): void {
    this.taskService.getDeletedTasks().subscribe(
      (tasks) => {
        this.deletedTasks = tasks.map((task: any) => ({
          _id: task._id, 
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
  //restore a deleted task to the main tasks list
  restoreTask(task: any): void {
    if (!task._id) {
      console.error('Task ID is missing.');
      return;
    }
    //call the task service to restore the task and update the local state
    this.taskService.restoreTask(task._id).subscribe(
      () => {
        this.deletedTasks = this.deletedTasks.filter(t => t._id !== task._id);
        this.updateDeletedTasksStorage();
        this.restoreToMainTasks(task);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error restoring task:', error);
      }
    );
  }

  updateDeletedTasksStorage(): void {
    localStorage.setItem('deletedTasks', JSON.stringify(this.deletedTasks));
  }
  //restore a task to the main tasks list and clear its _id
  restoreToMainTasks(task: any): void {
    task._id = undefined; 
    const mainTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    mainTasks.unshift(task);
    localStorage.setItem('tasks', JSON.stringify(mainTasks));
  }
  //filter tasks based on search query
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
