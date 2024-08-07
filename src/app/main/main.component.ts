import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  tasks = [
    { name: 'Learn Angular' },
    { name: 'Attend the meeting at 5pm' },
    { name: 'Play video games', completed: true },
    { name: 'Attend the meeting at 9am', completed: true }
  ]
}
