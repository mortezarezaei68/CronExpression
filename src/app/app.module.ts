
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialAngularModule } from './material-angular/material-angular.module';
import { CronEditorComponent } from './CronCompnent/cron-editor/cron-editor.component';
import { CronTimePickerComponent } from './CronCompnent/cron-time-picker/cron-time-picker.component';
import { CronTestComponent } from './cron-test/cron-test.component';
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [
    AppComponent,
    CronEditorComponent,
    CronTimePickerComponent,
    CronTestComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialAngularModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
