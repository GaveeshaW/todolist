//import necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
//class TasksComponent implements OnInit 
export class TasksComponent implements OnInit {

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  searchQuery: string = '';
  showImportant: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private cdr: ChangeDetectorRef, private taskService: TaskService) {
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

    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');
  }

  loadTasksFromDB(): void {
    this.taskService.getTasks().subscribe(
      (tasks: any) => {
        this.tasks = tasks
          .filter((task: any) => !task.isDeleted)
          .map((task: any) => ({
            _id: task._id,
            name: task.description,  // or use task.name if that's more appropriate
            description: task.description,
            isCompleted: task.isCompleted,
            isImportant: task.isImportant,
            editable: task.editable || false  // Optional field
          }));
  
        this.filteredTasks = [...this.tasks];
        this.cdr.detectChanges(); // Trigger change detection
      },
      (error) => {
        console.error('Error loading tasks:', error);
      }
    );
  }    

  //checks if the task is marked as compketed or not
  toggleTaskCompletion(task: any): void {
    task.isCompleted = !task.isCompleted;  
  
    this.taskService.updateTask(task._id, { isCompleted: task.isCompleted }).subscribe(
      (updatedTask) => {
        console.log('Task completion status updated successfully in DB:', updatedTask);
        this.loadTasksFromDB(); 
      },
      (error) => {
        console.error('Error updating task completion status in DB:', error);
      }
    );
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
      this.filteredTasks = this.tasks.filter(task => task.isImportant);
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
    task.isImportant = !task.isImportant;

    this.taskService.updateTask(task._id, { isImportant: task.isImportant }).subscribe(
      () => {
        this.loadTasksFromDB();
      },
      (error) => {
        console.error('Error updating task importance:', error);
      }
    );
  }

  //method used to update the task
  updateTask(task: Task, event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.innerText !== null) {
      task.name = target.innerText;

      console.log('Updating task:', task);

      const updatedData = {
        name: task.name,
        description: task.name,
        isCompleted: task.isCompleted,
        isImportant: task.isImportant
      };

      this.taskService.updateTask(task._id, updatedData).subscribe(
        (updatedTask) => {
          console.log('Task updated successfully in DB:', updatedTask);
          this.loadTasksFromDB();
        },
        (error) => {
          console.error('Error updating task in DB:', error);
        }
      );
    }
  }   
}