import { Component, OnInit, ViewChild } from '@angular/core';
import { CronEditorComponent } from '../CronCompnent/cron-editor/cron-editor.component';
import { CronOptions } from '../CronCompnent/CronOptions';

@Component({
  selector: 'app-cron-test',
  templateUrl: './cron-test.component.html',
  styleUrls: ['./cron-test.component.scss']
})
export class CronTestComponent implements OnInit {
  public cronExpression = '0 0 1/1 * *';
  public isCronDisabled = false;
  public cronOptions: CronOptions = {
    formInputClass: 'form-control cron-editor-input',
    formSelectClass: 'form-control cron-editor-select',
    formRadioClass: 'cron-editor-radio',
    formCheckboxClass: 'cron-editor-checkbox',

    defaultTime: '00:00:00',

    hideMinutesTab: false,
    hideHourlyTab: false,
    hideDailyTab: false,
    hideWeeklyTab: false,
    hideMonthlyTab: false,
    hideYearlyTab: false,
    hideAdvancedTab: false,
    hideSpecificWeekDayTab : false,
    hideSpecificMonthWeekTab : false,

    use24HourTime: true,
    hideSeconds: false,

    cronFlavor: 'standard'
  };

  @ViewChild('cronEditorDemo', {static: false}) cronEditorDemo: CronEditorComponent;

  cronFlavorChange() {
    this.cronEditorDemo.options = this.cronOptions;
    this.cronEditorDemo.regenerateCron();
  }
  constructor() { }

  ngOnInit() {
  }

}
