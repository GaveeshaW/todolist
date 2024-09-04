import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskComponent } from './task/task.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ImportantComponent } from './important/important.component';
import { PlannedComponent } from './planned/planned.component';
import { TasksComponent } from './tasks/tasks.component';
import { DeletedtasksComponent } from './deletedtasks/deletedtasks.component';
//all the routes are declared here which makes switcinf from one tab to another possible
const routes: Routes = [
  { path: '', redirectTo: '/task', pathMatch: 'full' },
  { path: 'task' , component: TaskComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent },
  { path: 'important', component: ImportantComponent },
  { path: 'planned', component: PlannedComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'deletedtasks', component: DeletedtasksComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
