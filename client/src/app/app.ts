import { Component } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './features/home/home.component';
import { ChatAssistantComponent } from './features/chat/chat-assistant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, HomeComponent, ChatAssistantComponent],
  template: `
    <app-header></app-header>
    <app-home></app-home>
    <app-footer></app-footer>
    <app-chat-assistant></app-chat-assistant>
  `,
  styleUrl: './app.scss'
})
export class App {}

