import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cron-time-picker',
  templateUrl: './cron-time-picker.component.html',
  styleUrls: ['./cron-time-picker.component.scss']
})
export class CronTimePickerComponent implements OnInit {

  @Output() onchange:EventEmitter<any> = new EventEmitter();

  @Input() public disabled: boolean;
  @Input() public model: any;
  @Input() public selectClass: string;
  @Input() public use24HourTime: boolean;
  @Input() public hideSeconds: boolean;

  public hours: number[];
  public minutes: number[];
  public seconds: number[];
  public hourTypes: string[];

  public async ngOnInit() {
      this.hours = this.use24HourTime ? this.range(0, 23) : this.range(0, 12);
      this.minutes = this.range(0, 59);
      this.seconds = this.range(0, 59);
      this.hourTypes = ['AM', 'PM'];
  }

  private range(start: number, end: number): number[] {
      const length = end - start + 1;
      return Array.apply(undefined, Array(length)).map((_, i) => i + start);
  }

}
