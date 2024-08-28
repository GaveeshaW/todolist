import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  tasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  filteredTasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  searchQuery: string = '';
  showImportant: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Get the current route
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });

    // Load user data from localStorage
    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');

    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
      this.filteredTasks = [...this.tasks];
    }
  }

  toggleTaskCompletion(task: any): void {
    const index = this.tasks.indexOf(task);
    if (index > -1) {
      task.completed = !task.completed;
      this.tasks.splice(index, 1);
      this.tasks.unshift(task);
      this.filteredTasks = [...this.tasks];
      this.saveTasksToStorage();
    }
  }

  saveTasksToStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  updateLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  saveDeletedTask(task: any): void {
    const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');
    deletedTasks.unshift(task);
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
  }

  deleteTask(index: number): void {
    const deletedTask = this.tasks.splice(index, 1)[0];
    this.updateLocalStorage();
    this.saveDeletedTask(deletedTask);
    this.onSearch();
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

  filterTasks(): void {
    if (this.showImportant) {
      this.filteredTasks = this.tasks.filter(task => task.important);
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }

  toggleImportantTasks(): void {
    this.showImportant = !this.showImportant;
    this.filterTasks();
  }

  toggleImportant(task: any): void {
    task.important = !task.important;
    this.saveTasksToStorage();
    this.filterTasks();
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.userName = this.signupForm.get('name')?.value;
      this.userEmail = this.signupForm.get('email')?.value;
    }
  }
}
