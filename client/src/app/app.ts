import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ChatAssistantComponent } from './features/chat/chat-assistant.component';
import { BackToTopComponent } from './layout/back-to-top/back-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, ChatAssistantComponent, BackToTopComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-chat-assistant></app-chat-assistant>
    <app-back-to-top></app-back-to-top>
  `,
  styleUrl: './app.scss'
})
export class App {}