import { Component, CUSTOM_ELEMENTS_SCHEMA, type ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { loadDialogWidget, loadFormWidget } from 'polkadot-sufficient-assets';
import { libConfig, libTheme } from '../lib/lib-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'angular-app';
  appConfig = libConfig;
  appTheme = libTheme;

  @ViewChild('psaDialog', { static: false }) psaDialog!: ElementRef;

  constructor() {
    loadFormWidget();
    loadDialogWidget();
  }

  handleClose() {
    this.psaDialog.nativeElement.open = false;
  }
  handleOpen() {
    this.psaDialog.nativeElement.open = true;
  }
}
