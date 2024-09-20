//import the necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-planned',
  templateUrl: './planned.component.html',
  styleUrl: './planned.component.css'
})
//class PlannedComponent implement oninit to ensure that all initializations and data loading are done before component displayed to user
export class PlannedComponent implements OnInit{

  tasks: { name: string; completed?: boolean; important?: boolean, _id: string }[] = [];

  filteredTasks = [...this.tasks];
  signupForm: FormGroup;
  toDoForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  isImportant: boolean = false;
  //the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private taskService: TaskService, private cdr: ChangeDetectorRef) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.toDoForm = this.fb.group({
      task: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || '';
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.currentDate = formatDate(new Date(), 'fullDate', 'en-US');
  }
  //method written to add the task
  addTask(): void {
    const taskName = this.toDoForm.get('task')?.value.trim();  // Get the task name from the form
  
    // Ensure the task name is not empty
    if (!taskName) {
      console.error('Task name is required');
      return;
    }
  
    // Create the task object with relevant properties
    const newTask: Task = {
      _id: '',  
      name: taskName.trim(),
      description: taskName.trim(),
      isImportant: this.isImportant,  // Use the value from your star toggle
      isCompleted: false,  // Set to false as default
      deleted: false
    };
  
    // Add the task via TaskService
    this.taskService.addTask(newTask).subscribe(
      (response) => {
        this.tasks.unshift({
          name: response.description,
          _id: response._id,
          completed: response.isCompleted,
          important: response.isImportant
        });
        this.filteredTasks = [...this.tasks];  // Update filtered tasks
  
        // Clear form and reset state
        this.clearForm();
        this.cdr.detectChanges();  // Trigger change detection to render the new task
      },
      (error) => {
        console.error('Error adding task:', error);
      }
    );
  }

  //the icon which is used to mark the task as importnant or not
  toggleStar() {
    this.isImportant = !this.isImportant;
  }

  //the method used to clear the form which is used in the cancek button
  clearForm() {
    this.toDoForm.reset();  
    this.isImportant = false;  
  }
}
