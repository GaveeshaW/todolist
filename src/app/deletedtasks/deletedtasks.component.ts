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
  signupForm: FormGroup;
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
    private cdr: ChangeDetectorRef
  ) {
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

  restoreTask(task: any): void {
    if (!task._id) {
      console.error('Task ID is missing.');
      return;
    }

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

  restoreToMainTasks(task: any): void {
    task._id = undefined; 
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
