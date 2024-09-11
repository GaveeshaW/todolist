//import necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
//class TasksComponent implements OnInit 
export class TasksComponent implements OnInit {

  tasks: { name: string; completed?: boolean; important?: boolean; editable?: boolean }[] = [];
  filteredTasks: { name: string; completed?: boolean; important?: boolean; editable?: boolean }[] = [];
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
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });

    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');

    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
      this.filteredTasks = [...this.tasks];
    }
  }
  //checks if the task is marked as compketed or not
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
  //save the tasks to storagr
  saveTasksToStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  //method to update the local storage
  updateLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  //save the deleted tasks to localstorage so that they can be displayed in the deleted tasks section
  saveDeletedTask(task: any): void {
    const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');
    deletedTasks.unshift(task);
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
  }
  //method to delete a task
  deleteTask(index: number): void {
    const deletedTask = this.tasks.splice(index, 1)[0];
    this.updateLocalStorage();
    this.saveDeletedTask(deletedTask);
    this.onSearch();
  }
  //method to search a task using the search bar
  onSearch(): void {
    if (this.searchQuery) {
      this.filteredTasks = this.tasks.filter(task =>
        task.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }
  //method used to filter the task and see if the task is importnt or not
  filterTasks(): void {
    if (this.showImportant) {
      this.filteredTasks = this.tasks.filter(task => task.important);
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }
  //method to check if the task is importnat or nti
  toggleImportantTasks(): void {
    this.showImportant = !this.showImportant;
    this.filterTasks();
  }
  //method to check the task's importnce and save it to local stoage
  toggleImportant(task: any): void {
    task.important = !task.important;
    this.saveTasksToStorage();
    this.filterTasks();
  }
  //method used to update the task
  updateTask(task: any, event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.innerText !== null) {
      task.name = target.innerText;
      this.saveTasksToStorage();
    }
  } 
}
