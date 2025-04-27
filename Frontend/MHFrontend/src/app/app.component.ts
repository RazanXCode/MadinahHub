import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './components/admin-dashboard/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MHFrontend';
}
