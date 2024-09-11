//importing necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { TaskService } from '../task.service';
import { Task } from '../task.model';

@Component({
  selector: 'app-important',
  templateUrl: './important.component.html',
  styleUrls: ['./important.component.css']
})

//defining importantcomponent module
export class ImportantComponent implements OnInit {
  
  importantTasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  allTasks: { name: string; completed?: boolean; important?: boolean }[] = [];

  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  filteredTasks = [...this.importantTasks];
  showImportant: boolean = false;
  activeRoute: string = '';

  //defining the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private taskService: TaskService) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  //to load important tasks from the local storage
  loadImportantTasks(): void {
    this.taskService.getTasks().subscribe(
      (tasks) => {
        this.allTasks = tasks.map((task: any) => ({
          name: task.description,
          completed: task.isCompleted,
          important: task.isImportant
        }));
        this.importantTasks = this.allTasks.filter(task => task.important);
        this.filteredTasks = [...this.importantTasks];
      },
      (error) => {
        console.error('Error loading important tasks:', error);
      }
    );
  }
  

  //save the tasks to local storage
  saveTasksToStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.allTasks));
  }

  //to check if the task is completed or not
  toggleTaskCompletion(task: any): void {
    const index = this.importantTasks.indexOf(task);
    if (index > -1) {
      task.completed = !task.completed;
      this.importantTasks.splice(index, 1);
      this.importantTasks.unshift(task);
      this.filteredTasks = [...this.importantTasks];
      this.updateMainTaskList(task);
      this.saveTasksToStorage();
    }
  }

  //add this task update the task list
  updateMainTaskList(updatedTask: any): void {
    const taskIndex = this.allTasks.findIndex(task => task.name === updatedTask.name);
    if (taskIndex > -1) {
      this.allTasks[taskIndex] = updatedTask;
    }
  }

  //to filter the important tasks 
  filterTasks(): void {
    this.filteredTasks = this.importantTasks.filter(task => task.important);
  }

  //to mark and check if the task is important or not
  toggleImportant(task: any): void {
    task.important = !task.important;
    this.updateMainTaskList(task);
    
    if (!task.important) {
      const taskIndex = this.importantTasks.indexOf(task);
      if(taskIndex > -1) {
        this.importantTasks.splice(taskIndex, 1);
      }
    }
    this.filterTasks();
    this.saveTasksToStorage();
  }

  //show and display the important tasks
  toggleImportantTasks(): void {
    this.showImportant = !this.showImportant;
    this.filterTasks();
  }

  ngOnInit(): void {
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });

    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');
    this.loadImportantTasks();
  }

  //to add a task
  addTask(): void {
    const taskName = window.prompt('Enter the task name: ');
    if(taskName && taskName.trim()) {
      const newTask = { name: taskName.trim(), important: true };
      this.importantTasks.unshift(newTask);
      this.allTasks.unshift(newTask);
      this.filteredTasks = [...this.importantTasks];
      this.saveTasksToStorage();
    }
  }
}
