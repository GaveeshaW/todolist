import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-deletedtasks',
  templateUrl: './deletedtasks.component.html',
  styleUrl: './deletedtasks.component.css'
})

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

  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute) {
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
    const storedDeletedTasks = localStorage.getItem('deletedTasks');
    if(storedDeletedTasks) {
      this.deletedTasks = JSON.parse(storedDeletedTasks);
    }
  }

  restoreTask(task: any): void {
    this.deletedTasks = this.deletedTasks.filter(t => t !== task);
    this.updateDeletedTasksStorage();
    this.restoreToMainTasks(task);
  }

  updateDeletedTasksStorage(): void {
    localStorage.setItem('deletedTasks', JSON.stringify(this.deletedTasks));
  }

  restoreToMainTasks(task: any): void {
    const mainTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    mainTasks.unshift(task);
    localStorage.setItem('tasks', JSON.stringify(mainTasks));
  }

  onSubmit() {
    if(this.signupForm.valid) {
      this.userName = this.signupForm.get('name')?.value;
      this.userEmail = this.signupForm.get('email')?.value;
    }
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
