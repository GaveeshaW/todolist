//import the necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-planned',
  templateUrl: './planned.component.html',
  styleUrl: './planned.component.css'
})
//class PlannedComponent implement oninit to ensure that all initializations and data loading are done before component displayed to user
export class PlannedComponent implements OnInit{

  tasks: { name: string; completed?: boolean; important?: boolean }[] = [];

  filteredTasks = [...this.tasks];
  signupForm: FormGroup;
  toDoForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  isImportant: boolean = false;
  //the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.toDoForm = this.fb.group({
      task: ['', Validators.required]
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
  }
  //method written to add the task
  addTask() {
    if (this.toDoForm.valid) {
      const taskName = this.toDoForm.get('task')?.value;
      const task = { name: taskName, important: false };
      this.tasks.unshift(task);
      this.toDoForm.reset();
      this.isImportant = false;
    }
  }
  //the icon which is used to mark the task as importnant or not
  toggleStar() {
    this.isImportant = !this.isImportant;
  }
  //ethod used to save the tasks to storage
  saveTasksToStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  //the method used to clear the form which is used in the cancek button
  clearForm() {
    this.toDoForm.reset({
      task: ''
    });
    this.isImportant = false;
  }
  //method used to submit the form when the add the task button is added
  submit() {
    const taskName = this.toDoForm.get('task')?.value;
    const storedTasks = localStorage.getItem('tasks');

    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }

    if (taskName && taskName.trim()) {
      const newTask = { name: taskName.trim(), important: this.isImportant };
      this.tasks.unshift(newTask);
      this.filteredTasks = [...this.tasks];
      this.saveTasksToStorage();
      this.clearForm();
    }
  }
}
