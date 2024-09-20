//main.component.ts
//import necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../task.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  tasks: { name: string; completed?: boolean; important?: boolean; deleted?: boolean, _id: string }[] = [];
  filteredTasks = [...this.tasks];
  deletedTasks: { name: string; completed?: boolean; important?: boolean, _id: string }[] = [];
  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  searchQuery: string = '';
  showImportant: boolean = false;
  showDeleted: boolean = false;
  activeRoute: string = '';

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
    this.loadTasksFromDB();
    this.activeRoute = this.router.url;
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });

    // Keep using localStorage for user details
    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');
  }

  loadDeletedTasks(): void {
    this.taskService.getDeletedTasks().subscribe(
      (tasks: any[]) => {
        this.deletedTasks = tasks.map(task => ({
          name: task.description,
          completed: task.isCompleted,
          important: task.isImportant,
          _id: task._id // Corrected to _id to match the usual MongoDB field
        }));
        this.filteredTasks = [...this.deletedTasks]; // Update the filtered task list
      },
      (error) => {
        console.error('Error loading deleted tasks:', error);
        alert(`An error occurred: ${error.message}`);
      }
    );    
  }  

  // "Delete" a task by marking it as deleted
  deleteTask(taskId: string, index: number): void {
    // Call the delete API to soft-delete the task
    this.taskService.deleteTask(taskId).subscribe(
      () => {
        // Remove the task from the tasks array after successful deletion
        this.tasks.splice(index, 1); // Remove the task at the specific index
        this.filteredTasks = [...this.tasks]; // Update the filtered tasks array
      },
      (error) => {
        console.error('Error deleting task:', error);
        alert(`An error occurred: ${error.message}`);
      }
    );
  }   

  // Restore a deleted task
  restoreTask(index: number): void {
    const taskToRestore = this.deletedTasks[index];
  
    // Mark the task as not deleted and update the database
    this.taskService.updateTask(taskToRestore._id, {
      ...taskToRestore,
      deleted: false,
      description: '',
      isImportant: '',
      isCompleted: false
    }).subscribe(
      (response) => {
        this.deletedTasks.splice(index, 1);
        this.tasks.unshift(response); // Add the task back to the active task list
        this.filteredTasks = [...this.tasks];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error restoring task:', error);
      }
    );
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

  toggleTaskCompletion(task: any): void {
    task.completed = !task.completed;
  
    this.taskService.updateTask(task._id, { isCompleted: task.completed }).subscribe(
      () => {
        // Handle successful update
        this.loadTasksFromDB(); // Reload important tasks to reflect changes
      },
      (error) => {
        console.error('Error updating task completion:', error);
      }
    );
  }    

  toggleImportantTasks(): void {
    this.showImportant = !this.showImportant;
    this.filterTasks();
  }

  toggleImportant(task: any): void {
    task.important = !task.important; 
  
    this.taskService.updateTask(task._id, { isImportant: task.important }).subscribe(
      () => {  
        this.loadTasksFromDB(); 
      },
      (error) => {
        console.error('Error updating task:', error);
        alert(`An error occurred: ${error.message}`);
      }
    );
  }   

  filterTasks(): void {
    if (this.showImportant) {
      this.filteredTasks = this.tasks.filter(task => task.important);
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }

  loadTasksFromDB(): void {
    this.taskService.getTasks().subscribe(
      (tasks) => {
        this.tasks = tasks
          .filter((task: any) => !task.isDeleted)
          .map((task: any) => ({
            _id: task._id,
            name: task.description,
            completed: task.isCompleted,
            important: task.isImportant,
            deleted: task.isDeleted
          }));
  
        this.filteredTasks = [...this.tasks];
        this.cdr.detectChanges(); // Trigger change detection
      },
      (error) => {
        console.error('Error loading tasks:', error);
      }
    );
  }  

  addTask(): void {
    const taskName = window.prompt('Enter the task name: ');
    if (taskName && taskName.trim()) {
      const newTask = { _id: '', name: taskName.trim(), description: taskName.trim(), isImportant: false, isCompleted: false, isDeleted: false };

      // Add the task to the database via the TaskService
      this.taskService.addTask(newTask).subscribe(
        (response) => {
          // Add the new task to the top of the array
          this.tasks.unshift({
            name: response.description,  
            _id: response._id,
            completed: response.isCompleted,
            important: response.isImportant
          });
          this.filteredTasks = [...this.tasks];  // Update filtered tasks

          this.cdr.detectChanges();  // Trigger change detection to render the new task
        },
        (error) => {
          console.error('Error adding task:', error);
        }
      );
    }
  }
}