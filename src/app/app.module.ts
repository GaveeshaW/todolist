import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { TaskComponent } from './task/task.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { HttpClientModule } from '@angular/common/http';
import { MainComponent } from './main/main.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TaskComponent,
    SignupComponent,
    LoginComponent,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
