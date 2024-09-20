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
  // In task.service.ts
  deleteTask(taskId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/delete`, {});
  }    

  restoreTask(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/restore`, {});
  }

  // In task.service.ts
  getDeletedTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deleted-tasks`);
  }

  updateTask(taskId: string, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}`, updatedData, { headers: this.getAuthHeaders() });
  }    
}