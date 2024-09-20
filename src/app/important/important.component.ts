//importing necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-important',
  templateUrl: './important.component.html',
  styleUrls: ['./important.component.css']
})

//defining importantcomponent module
export class ImportantComponent implements OnInit {
  
  importantTasks: { name: string; completed?: boolean; important?: boolean, _id: string }[] = [];
  allTasks: { name: string; completed?: boolean; important?: boolean, _id: string }[] = [];

  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  filteredTasks = [...this.importantTasks];
  showImportant: boolean = false;
  activeRoute: string = '';
  searchQuery: string = '';

  //defining the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private taskService: TaskService, private cdr: ChangeDetectorRef) {
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
          _id: task._id,
          name: task.description,
          completed: task.isCompleted,
          important: task.isImportant
        }));
        this.importantTasks = this.allTasks.filter(task => task.important);
        this.filteredTasks = [...this.importantTasks];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading important tasks:', error);
      }
    );
  }


  //to check if the task is completed or not
  toggleTaskCompletion(task: any): void {
    task.completed = !task.completed;
  
    this.taskService.updateTask(task._id, { isCompleted: task.completed }).subscribe(
      () => {  
        this.loadImportantTasks();
      },
      (error) => {
        console.error('Error updating task:', error);
        alert(`An error occurred: ${error.message}`);
      }
    );
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
    this.filteredTasks = [...this.importantTasks];
  }

  //to mark and check if the task is important or not
  toggleImportant(task: any): void {
    task.important = !task.important;
  
    this.taskService.updateTask(task._id, { isImportant: task.important }).subscribe(
      () => {
        // Handle successful update
        this.loadImportantTasks(); // Reload important tasks to reflect changes
      },
      (error) => {
        console.error('Error updating task importance:', error);
      }
    );
  }  

  //show and display the important tasks
  toggleImportantTasks(): void {
    this.showImportant = !this.showImportant;
    this.filterTasks();
  }

  onSearch(): void {
    if (this.searchQuery) {
      this.filteredTasks = this.importantTasks.filter(task =>
        task.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredTasks = [...this.importantTasks];
    }
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.loadImportantTasks;
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
    if (taskName && taskName.trim()) {
      const newTask = { _id: '', name: taskName.trim(), description: taskName.trim(), isImportant: true, isCompleted: false, isDeleted: false };

      // Add the task to the database via the TaskService
      this.taskService.addTask(newTask).subscribe(
        (response) => {
          // Add the new task to the top of the array
          this.allTasks.unshift({
            name: response.description,  
            _id: response._id,
            completed: response.isCompleted,
            important: response.isImportant
          });
          this.filteredTasks = [...this.allTasks];  // Update filtered tasks
          this.loadImportantTasks();
          this.cdr.detectChanges();  // Trigger change detection to render the new task
        },
        (error) => {
          console.error('Error adding task:', error);
        }
      );
    }
  }
}
