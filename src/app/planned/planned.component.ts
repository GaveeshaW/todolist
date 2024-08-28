import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-planned',
  templateUrl: './planned.component.html',
  styleUrl: './planned.component.css'
})
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

  onSubmit() {
    if(this.signupForm.valid) {
      this.userName = this.signupForm.get('name')?.value;
      this.userEmail = this.signupForm.get('email')?.value;
    }
  }

  addTask() {
    if (this.toDoForm.valid) {
      const taskName = this.toDoForm.get('task')?.value;
      const task = { name: taskName, important: false };
      this.tasks.unshift(task);
      this.toDoForm.reset();
      this.isImportant = false;
    }
  }

  toggleImportant(task: any): void {
    task.important = !task.important;
  }

  toggleStar() {
    this.isImportant = !this.isImportant;
  }

  saveTasksToStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  clearForm() {
    this.toDoForm.reset({
      task: ''
    });
    this.isImportant = false;
  }

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
