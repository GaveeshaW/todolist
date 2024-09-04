//import necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
//class maincomponent implements oninit to ensure that all initializations and data loading are done just before the component is 
//displayed to the user
export class MainComponent implements OnInit {

  tasks: { name: string; completed?: boolean; important?: boolean }[] = [];

  filteredTasks = [...this.tasks];
  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  searchQuery: string = '';
  showImportant: boolean = false;
  activeRoute: string = '';
  //the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    })
  }
  
  ngOnInit(): void {
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });

    const storedTasks = localStorage.getItem('tasks');
    this.tasks = storedTasks ? JSON.parse(storedTasks) : this.tasks;

    this.filteredTasks = [...this.tasks];

    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');
    this.loadTasksFromStorage();
  }
  //load the tasks from storage
  loadTasksFromStorage(): void {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
      this.filteredTasks = [...this.tasks];
    }
  }
  //save the deleted tasks in localstorage
  saveDeletedTask(task: any): void {
    const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');
    deletedTasks.unshift(task);
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
  }
  //method to delete the task
  deleteTask(index: number): void {
    const deletedTask = this.tasks.splice(index, 1)[0];
    this.updateLocalStorage();
    this.saveDeletedTask(deletedTask);
    this.onSearch();
  }
  //search bar feature
  onSearch(): void {
    if (this.searchQuery) {
      this.filteredTasks = this.tasks.filter(task =>
        task.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }
  //method to save the tasks to storage
  saveTasksToStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  //method to update the local storage with the existing tasks
  updateLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  //to mark a task as done or not
  toggleTaskCompletion(task: any): void {
    const index = this.tasks.indexOf(task);
    if(index > -1) {
      task.completed = !task.completed;
      this.tasks.splice(index, 1);
      this.tasks.unshift(task);
      this.filteredTasks = [...this.tasks];
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }
  //filter the important tasks
  toggleImportantTasks(): void {
    this.showImportant = !this.showImportant;
    this.filterTasks();
  }
  //to save the important tasks to localstorage
  toggleImportant(task: any): void {
    task.important = !task.important;
    this.saveTasksToStorage();
    this.filterTasks();
  }
  //to filter if the tasks are impirtrant or nt
  filterTasks(): void {
    if(this.showImportant) {
      this.filteredTasks = this.tasks.filter(task => task.important);
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }
  //method ti add a task
  addTask(): void {
    const taskName = window.prompt('Enter the task name: ');
    if(taskName && taskName.trim()) {
      const newTask = { name: taskName.trim() };
      this.tasks.unshift(newTask);
      this.filteredTasks = [...this.tasks];
      this.saveTasksToStorage();
    }
  }
}
