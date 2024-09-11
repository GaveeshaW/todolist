//importing necessary modules
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-deletedtasks',
  templateUrl: './deletedtasks.component.html',
  styleUrl: './deletedtasks.component.css'
})

//defining DeletedTasksComponent module
export class DeletedtasksComponent {
  tasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  signupForm: FormGroup;
  userName: string = '';
  userEmail: string = '';
  currentDate: string = '';
  activeRoute: string = '';
  searchQuery: string = '';
  filteredTasks = [...this.tasks];

  deletedTasks: { name: string; completed?: boolean; important?: boolean }[] = [];
  //dfining the constructor
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute) {
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

    this.loadDeletedTasks();
  }
  //to load the deleted tasks from the local storage
  loadDeletedTasks(): void {
    const storedDeletedTasks = localStorage.getItem('deletedTasks');
    if(storedDeletedTasks) {
      this.deletedTasks = JSON.parse(storedDeletedTasks);
    }
  }
  //restore to main tasks the deleted task
  restoreTask(task: any): void {
    this.deletedTasks = this.deletedTasks.filter(t => t !== task);
    this.updateDeletedTasksStorage();
    this.restoreToMainTasks(task);
  }
  //update the deleted tasks on he local storage
  updateDeletedTasksStorage(): void {
    localStorage.setItem('deletedTasks', JSON.stringify(this.deletedTasks));
  }
  //restore the deleted task on the main tasks array and update on local storage
  restoreToMainTasks(task: any): void {
    const mainTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    mainTasks.unshift(task);
    localStorage.setItem('tasks', JSON.stringify(mainTasks));
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
}
