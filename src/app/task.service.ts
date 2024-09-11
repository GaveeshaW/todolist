import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) {}

  // Helper method to get the token and set headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');  // Fetch token from localStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add token to the headers
    });
  }

  // Get tasks
  getTasks(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Add task
  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}`, task);
  }

  // Edit task (Optional if needed later)
  editTask(taskId: string, task: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}`, task, { headers: this.getAuthHeaders() });
  }

  // Delete task (Optional if needed later)
  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}`, { headers: this.getAuthHeaders() });
  }

  updateTask(task: any): Observable<any> {
  if (!task.id) {
    throw new Error('Task ID is missing');
  }
    return this.http.put(`/api/tasks/${task.id}`, task);
  }
}
