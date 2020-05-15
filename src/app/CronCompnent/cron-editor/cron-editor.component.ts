import {
	Component,
	OnInit,
	OnChanges,
	Input,
	EventEmitter,
	Output,
	SimpleChanges,
	AfterViewInit,
	ViewChild
} from '@angular/core';
import { CronOptions } from '../CronOptions';
import { MonthWeeks, Days, Months, TabsName } from '../enums';
import { MatTabChangeEvent, MatRadioChange } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-cron-editor',
	templateUrl: './cron-editor.component.html',
	styleUrls: [ './cron-editor.component.scss' ]
})
export class CronEditorComponent implements OnInit, OnChanges, AfterViewInit {
	@ViewChild('tabGroup', { static: false })
	tabGroup;
	RadioOptionValue: string[] = [ 'everyDays', 'everyWeekDay' ];
	@Input() public disabled: boolean;
	@Input() public options: CronOptions;

	@Input() cron: string;

	public tabChangeEvent: MatTabChangeEvent;
	public activeTab;
	public selectOptions = this.getSelectOptions();
	public state: any;
	public selectedIndex: string;
	private isDirty: boolean;
	public fgCron: FormGroup;

	get isCronFlavorQuartz() {
		return this.options.cronFlavor === 'quartz';
	}

	get isCronFlavorStandard() {
		return this.options.cronFlavor === 'standard';
	}

	get yearDefaultChar() {
		return this.options.cronFlavor === 'quartz' ? '*' : '';
	}

	get weekDayDefaultChar() {
		return this.options.cronFlavor === 'quartz' ? '?' : '*';
	}

	get monthDayDefaultChar() {
		return this.options.cronFlavor === 'quartz' ? '?' : '*';
	}

	constructor(private fb: FormBuilder) {
		this.fgCron = fb.group({
			MinuteMinutes: [ '', [ Validators.required ] ],
			MinuteSeconds: [ '', [ Validators.required ] ],
			HourlyHours: [ '', [ Validators.required ] ],
			HourlyMinutes: [ '', [ Validators.required ] ],
			EverydayDays: [ '', [ Validators.required ] ],
			DailyEverydays: [ '', [ Validators.required ] ],
			DailyEveryWeekDay: [ '', [ Validators.required ] ],
			Weekly: [ '', [ Validators.required ] ],
			WeeklySat: [ '', [ Validators.required ] ],
			WeeklySun: [ '', [ Validators.required ] ],
			WeeklyMon: [ '', [ Validators.required ] ],
			WeeklyTue: [ '', [ Validators.required ] ],
			WeeklyWed: [ '', [ Validators.required ] ],
			WeeklyThu: [ '', [ Validators.required ] ],
			WeeklyFri: [ '', [ Validators.required ] ],
			MonthlySpecificDayDay: [ '', [ Validators.required ] ],
			MonthlySpecificDayMonth: [ '', [ Validators.required ] ],
			MonthlySpecificDay: [ '', [ Validators.required ] ],
			MonthlySpecificWeekDayMonthWeek: [ '', [ Validators.required ] ],
			MonthlySpecificWeekDayDay: [ '', [ Validators.required ] ],
			MonthlySpecificWeekDayMonth: [ '', [ Validators.required ] ],
			MonthlySpecificWeekDay: [ '', [ Validators.required ] ],
			YearlySpecificMonthDayMonth: [ '', [ Validators.required ] ],
			YearlySpecificMonthDayDay: [ '', [ Validators.required ] ],
			YearlySpecificMonthWeekMonthWeek: [ '', [ Validators.required ] ],
			YearlySpecificMonthWeekDay: [ '', [ Validators.required] ],
			YearlySpecificMonthWeekMonth: [ '', [ Validators.required ] ],
			advancedExpression: [ '', [ Validators.required ] ]
		});
	}

	public ngOnInit() {
		this.state = this.getDefaultState();
		this.handleModelChange(this.cron);
	}

	public async ngOnChanges(changes: SimpleChanges) {
		const newCron = changes['cron'];
		if (newCron && !newCron.firstChange) {
			this.handleModelChange(this.cron);
		}
	}

	tabChanged(tabChangeEvent: MatTabChangeEvent) {
		this.activeTab = tabChangeEvent.tab.textLabel.toLowerCase();
	}

	public dayDisplay(day: string): string {
		return Days[day];
	}

	public monthWeekDisplay(monthWeekNumber: number): string {
		return MonthWeeks[monthWeekNumber];
	}

	public monthDisplay(month: number): string {
		return Months[month];
	}

	public DisplayTab(TabLabel: number): string {
		return TabsName[TabLabel];
	}

	public monthDayDisplay(month: string): string {
		if (month === 'L') {
			return 'Last Day';
		} else if (month === 'LW') {
			return 'Last Weekday';
		} else if (month === '1W') {
			return 'First Weekday';
		} else {
			return `${month}${this.getOrdinalSuffix(month)} day`;
		}
	}

	public regenerateCron() {
		// debugger;
		this.isDirty = true;
		switch (this.activeTab) {
			case 'minutes':
				this.cron =
					// tslint:disable-next-line: max-line-length
					`${this.isCronFlavorQuartz ? this.state.minutes.seconds : ''} 0/${this.state.minutes
						.minutes} * 1/1 * ${this.weekDayDefaultChar} ${this.yearDefaultChar}`.trim();
				break;
			case 'hourly':
				// tslint:disable-next-line: max-line-length
				this.cron = `${this.isCronFlavorQuartz ? this.state.hourly.seconds : ''} ${this.state.hourly
					.minutes} 0/${this.state.hourly.hours} 1/1 * ${this.weekDayDefaultChar} ${this
					.yearDefaultChar}`.trim();
				break;
			case 'daily':
				switch (this.state.daily.subTab) {
					case 'everyDays':
						// tslint:disable-next-line: max-line-length
						this.cron = `${this.isCronFlavorQuartz ? this.state.daily.everyDays.seconds : ''} ${this.state
							.daily.everyDays.minutes} ${this.hourToCron(
							this.state.daily.everyDays.hours,
							this.state.daily.everyDays.hourType
						)} 1/${this.state.daily.everyDays.days} * ${this.weekDayDefaultChar} ${this
							.yearDefaultChar}`.trim();
						break;
					case 'everyWeekDay':
						// tslint:disable-next-line: max-line-length
						this.cron = `${this.isCronFlavorQuartz ? this.state.daily.everyWeekDay.seconds : ''} ${this
							.state.daily.everyWeekDay.minutes} ${this.hourToCron(
							this.state.daily.everyWeekDay.hours,
							this.state.daily.everyWeekDay.hourType
						)} ${this.monthDayDefaultChar} * MON-FRI ${this.yearDefaultChar}`.trim();
						break;
					default:
						throw new Error('Invalid cron daily subtab selection');
				}
				break;
			case 'weekly':
				const days = this.selectOptions.days
					.reduce((acc, day) => (this.state.weekly[day] ? acc.concat([ day ]) : acc), [])
					.join(',');
				// tslint:disable-next-line: max-line-length
				this.cron = `${this.isCronFlavorQuartz ? this.state.weekly.seconds : ''} ${this.state.weekly
					.minutes} ${this.hourToCron(this.state.weekly.hours, this.state.weekly.hourType)} ${this
					.monthDayDefaultChar} * ${days} ${this.yearDefaultChar}`.trim();
				break;
			case 'monthly':
				switch (this.state.monthly.subTab) {
					case 'specificDay':
						// tslint:disable-next-line: max-line-length
						this.cron = `${this.isCronFlavorQuartz ? this.state.monthly.specificDay.seconds : ''} ${this
							.state.monthly.specificDay.minutes} ${this.hourToCron(
							this.state.monthly.specificDay.hours,
							this.state.monthly.specificDay.hourType
						)} ${this.state.monthly.specificDay.day} 1/${this.state.monthly.specificDay.months} ${this
							.weekDayDefaultChar} ${this.yearDefaultChar}`.trim();
						break;
					case 'specificWeekDay':
						// tslint:disable-next-line: max-line-length
						this.cron = `${this.isCronFlavorQuartz ? this.state.monthly.specificWeekDay.seconds : ''} ${this
							.state.monthly.specificWeekDay.minutes} ${this.hourToCron(
							this.state.monthly.specificWeekDay.hours,
							this.state.monthly.specificWeekDay.hourType
						)} ${this.monthDayDefaultChar} 1/${this.state.monthly.specificWeekDay.months} ${this.state
							.monthly.specificWeekDay.day}${this.state.monthly.specificWeekDay.monthWeek} ${this
							.yearDefaultChar}`.trim();
						break;
					default:
						throw new Error('Invalid cron monthly subtab selection');
				}
				break;
			case 'yearly':
				switch (this.state.yearly.subTab) {
					case 'specificMonthDay':
						// tslint:disable-next-line: max-line-length
						this.cron = `${this.isCronFlavorQuartz ? this.state.yearly.specificMonthDay.seconds : ''} ${this
							.state.yearly.specificMonthDay.minutes} ${this.hourToCron(
							this.state.yearly.specificMonthDay.hours,
							this.state.yearly.specificMonthDay.hourType
						)} ${this.state.yearly.specificMonthDay.day} ${this.state.yearly.specificMonthDay.month} ${this
							.weekDayDefaultChar} ${this.yearDefaultChar}`.trim();
						break;
					case 'specificMonthWeek':
						// tslint:disable-next-line: max-line-length
						this.cron = `${this.isCronFlavorQuartz
							? this.state.yearly.specificMonthWeek.seconds
							: ''} ${this.state.yearly.specificMonthWeek.minutes} ${this.hourToCron(
							this.state.yearly.specificMonthWeek.hours,
							this.state.yearly.specificMonthWeek.hourType
						)} ${this.monthDayDefaultChar} ${this.state.yearly.specificMonthWeek.month} ${this.state.yearly
							.specificMonthWeek.day}${this.state.yearly.specificMonthWeek.monthWeek} ${this
							.yearDefaultChar}`.trim();
						break;
					default:
						throw new Error('Invalid cron yearly subtab selection');
				}
				break;
			case 'advanced':
				this.cron = this.state.advanced.expression;
				break;
			default:
				throw new Error('Invalid cron active tab selection');
		}
	}

	private getAmPmHour(hour: number) {
		return this.options.use24HourTime ? hour : (hour + 11) % 12 + 1;
	}

	private getHourType(hour: number) {
		return this.options.use24HourTime ? undefined : hour >= 12 ? 'PM' : 'AM';
	}

	private hourToCron(hour: number, hourType: string) {
		if (this.options.use24HourTime) {
			return hour;
		} else {
			return hourType === 'AM' ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;
		}
	}

	private handleModelChange(cron: string) {
		if (this.isDirty) {
			this.isDirty = false;
			return;
		} else {
			this.isDirty = false;
		}

		if (!this.cronIsValid(cron)) {
			if (this.isCronFlavorQuartz) {
				throw new Error('Invalid cron expression, there must be 6 or 7 segments');
			}

			if (this.isCronFlavorStandard) {
				throw new Error('Invalid cron expression, there must be 5 segments');
			}
		}

		const origCron: string = cron;
		if (cron.split(' ').length === 5 && this.isCronFlavorStandard) {
			cron = `0 ${cron} *`;
		}

		const [ seconds, minutes, hours, dayOfMonth, month, dayOfWeek ] = cron.split(' ');

		if (cron.match(/\d+ 0\/\d+ \* 1\/1 \* [\?\*] \*/)) {
			this.activeTab = 'minutes';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.minutes.minutes = parseInt(minutes.substring(2), 10);
			this.state.minutes.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ 0\/\d+ 1\/1 \* [\?\*] \*/)) {
			this.activeTab = 'hourly';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.hourly.hours = parseInt(hours.substring(2), 10);
			this.state.hourly.minutes = parseInt(minutes, 10);
			this.state.hourly.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ \d+ 1\/\d+ \* [\?\*] \*/)) {
			this.activeTab = 'daily';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.daily.subTab = 'everyDays';
			this.state.daily.everyDays.days = parseInt(dayOfMonth.substring(2), 10);
			const parsedHours = parseInt(hours, 10);
			this.state.daily.everyDays.hours = this.getAmPmHour(parsedHours);
			this.state.daily.everyDays.hourType = this.getHourType(parsedHours);
			this.state.daily.everyDays.minutes = parseInt(minutes, 10);
			this.state.daily.everyDays.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ \d+ [\?\*] \* MON-FRI \*/)) {
			this.activeTab = 'daily';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.daily.subTab = 'everyWeekDay';
			const parsedHours = parseInt(hours, 10);
			this.state.daily.everyWeekDay.hours = this.getAmPmHour(parsedHours);
			this.state.daily.everyWeekDay.hourType = this.getHourType(parsedHours);
			this.state.daily.everyWeekDay.minutes = parseInt(minutes, 10);
			this.state.daily.everyWeekDay.seconds = parseInt(seconds, 10);
		} else if (
			cron.match(/\d+ \d+ \d+ [\?\*] \* (MON|TUE|WED|THU|FRI|SAT|SUN)(,(MON|TUE|WED|THU|FRI|SAT|SUN))* \*/)
		) {
			this.activeTab = 'weekly';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.selectOptions.days.forEach((weekDay) => (this.state.weekly[weekDay] = false));
			dayOfWeek.split(',').forEach((weekDay) => (this.state.weekly[weekDay] = true));
			const parsedHours = parseInt(hours, 10);
			this.state.weekly.hours = this.getAmPmHour(parsedHours);
			this.state.weekly.hourType = this.getHourType(parsedHours);
			this.state.weekly.minutes = parseInt(minutes, 10);
			this.state.weekly.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ \d+ (\d+|L|LW|1W) 1\/\d+ [\?\*] \*/)) {
			this.activeTab = 'monthly';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.monthly.subTab = 'specificDay';
			this.state.monthly.specificDay.day = dayOfMonth;
			this.state.monthly.specificDay.months = parseInt(month.substring(2), 10);
			const parsedHours = parseInt(hours, 10);
			this.state.monthly.specificDay.hours = this.getAmPmHour(parsedHours);
			this.state.monthly.specificDay.hourType = this.getHourType(parsedHours);
			this.state.monthly.specificDay.minutes = parseInt(minutes, 10);
			this.state.monthly.specificDay.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ \d+ [\?\*] 1\/\d+ (MON|TUE|WED|THU|FRI|SAT|SUN)((#[1-5])|L) \*/)) {
			const day = dayOfWeek.substr(0, 3);
			const monthWeek = dayOfWeek.substr(3);
			this.activeTab = 'monthly';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.monthly.subTab = 'specificWeekDay';
			this.state.monthly.specificWeekDay.monthWeek = monthWeek;
			this.state.monthly.specificWeekDay.day = day;
			this.state.monthly.specificWeekDay.months = parseInt(month.substring(2), 10);
			const parsedHours = parseInt(hours, 10);
			this.state.monthly.specificWeekDay.hours = this.getAmPmHour(parsedHours);
			this.state.monthly.specificWeekDay.hourType = this.getHourType(parsedHours);
			this.state.monthly.specificWeekDay.minutes = parseInt(minutes, 10);
			this.state.monthly.specificWeekDay.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ \d+ (\d+|L|LW|1W) \d+ [\?\*] \*/)) {
			this.activeTab = 'yearly';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.yearly.subTab = 'specificMonthDay';
			this.state.yearly.specificMonthDay.month = parseInt(month, 10);
			this.state.yearly.specificMonthDay.day = dayOfMonth;
			const parsedHours = parseInt(hours, 10);
			this.state.yearly.specificMonthDay.hours = this.getAmPmHour(parsedHours);
			this.state.yearly.specificMonthDay.hourType = this.getHourType(parsedHours);
			this.state.yearly.specificMonthDay.minutes = parseInt(minutes, 10);
			this.state.yearly.specificMonthDay.seconds = parseInt(seconds, 10);
		} else if (cron.match(/\d+ \d+ \d+ [\?\*] \d+ (MON|TUE|WED|THU|FRI|SAT|SUN)((#[1-5])|L) \*/)) {
			const day = dayOfWeek.substr(0, 3);
			const monthWeek = dayOfWeek.substr(3);
			this.activeTab = 'yearly';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.yearly.subTab = 'specificMonthWeek';
			this.state.yearly.specificMonthWeek.monthWeek = monthWeek;
			this.state.yearly.specificMonthWeek.day = day;
			this.state.yearly.specificMonthWeek.month = parseInt(month, 10);
			const parsedHours = parseInt(hours, 10);
			this.state.yearly.specificMonthWeek.hours = this.getAmPmHour(parsedHours);
			this.state.yearly.specificMonthWeek.hourType = this.getHourType(parsedHours);
			this.state.yearly.specificMonthWeek.minutes = parseInt(minutes, 10);
			this.state.yearly.specificMonthWeek.seconds = parseInt(seconds, 10);
		} else {
			this.activeTab = 'advanced';
			this.selectedIndex = this.DisplayTab(this.activeTab);
			this.state.advanced.expression = origCron;
		}
	}

	private cronIsValid(cron: string): boolean {
		if (cron) {
			const cronParts = cron.split(' ');

			// tslint:disable-next-line: max-line-length
			return (
				(this.isCronFlavorQuartz && (cronParts.length === 6 || cronParts.length === 7)) ||
				(this.isCronFlavorStandard && cronParts.length === 5)
			);
		}

		return false;
	}

	ngAfterViewInit(): void {}

	private getDefaultState() {
		const [ defaultHours, defaultMinutes, defaultSeconds ] = this.options.defaultTime.split(':').map(Number);

		return {
			minutes: {
				minutes: 1,
				seconds: 0
			},
			hourly: {
				hours: 1,
				minutes: 0,
				seconds: 0
			},
			daily: {
				subTab: 'everyDays',
				everyDays: {
					days: 1,
					hours: this.getAmPmHour(defaultHours),
					minutes: defaultMinutes,
					seconds: defaultSeconds,
					hourType: this.getHourType(defaultHours)
				},
				everyWeekDay: {
					hours: this.getAmPmHour(defaultHours),
					minutes: defaultMinutes,
					seconds: defaultSeconds,
					hourType: this.getHourType(defaultHours)
				}
			},
			weekly: {
				MON: true,
				TUE: false,
				WED: false,
				THU: false,
				FRI: false,
				SAT: false,
				SUN: false,
				hours: this.getAmPmHour(defaultHours),
				minutes: defaultMinutes,
				seconds: defaultSeconds,
				hourType: this.getHourType(defaultHours)
			},
			monthly: {
				subTab: 'specificDay',
				specificDay: {
					day: '1',
					months: 1,
					hours: this.getAmPmHour(defaultHours),
					minutes: defaultMinutes,
					seconds: defaultSeconds,
					hourType: this.getHourType(defaultHours)
				},
				specificWeekDay: {
					monthWeek: '#1',
					day: 'MON',
					months: 1,
					hours: this.getAmPmHour(defaultHours),
					minutes: defaultMinutes,
					seconds: defaultSeconds,
					hourType: this.getHourType(defaultHours)
				}
			},
			yearly: {
				subTab: 'specificMonthDay',
				specificMonthDay: {
					month: 1,
					day: '1',
					hours: this.getAmPmHour(defaultHours),
					minutes: defaultMinutes,
					seconds: defaultSeconds,
					hourType: this.getHourType(defaultHours)
				},
				specificMonthWeek: {
					monthWeek: '#1',
					day: 'MON',
					month: 1,
					hours: this.getAmPmHour(defaultHours),
					minutes: defaultMinutes,
					seconds: defaultSeconds,
					hourType: this.getHourType(defaultHours)
				}
			},
			advanced: {
				expression: this.isCronFlavorQuartz ? '0 15 10 L-2 * ? *' : '15 10 2 * *'
			}
		};
	}

	private getOrdinalSuffix(value: string) {
		if (value.length > 1) {
			const secondToLastDigit = value.charAt(value.length - 2);
			if (secondToLastDigit === '1') {
				return 'th';
			}
		}

		const lastDigit = value.charAt(value.length - 1);
		switch (lastDigit) {
			case '1':
				return 'st';
			case '2':
				return 'nd';
			case '3':
				return 'rd';
			default:
				return 'th';
		}
	}

	private getSelectOptions() {
		return {
			months: this.getRange(1, 12),
			monthWeeks: [ '#1', '#2', '#3', '#4', '#5', 'L' ],
			days: [ 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN' ],
			minutes: this.getRange(0, 59),
			fullMinutes: this.getRange(0, 59),
			seconds: this.getRange(0, 59),
			hours: this.getRange(1, 23),
			monthDays: this.getRange(1, 31),
			monthDaysWithLasts: [ '1W', ...[ ...this.getRange(1, 31).map(String) ], 'LW', 'L' ],
			monthDaysWithOutLasts: [ ...[ ...this.getRange(1, 31).map(String) ] ],
			hourTypes: [ 'AM', 'PM' ]
		};
	}

	private getRange(start: number, end: number): number[] {
		const length = end - start + 1;
		return Array.apply(null, Array(length)).map((_, i) => i + start);
	}

	get getMinuteMinutes() {
		return this.fgCron.get('MinuteMinutes');
	}

	get getMinuteSeconds() {
		return this.fgCron.get('MinuteSeconds');
	}

	get getHourlyHours() {
		return this.fgCron.get('HourlyHours');
	}

	get getHourlyMinutes() {
		return this.fgCron.get('HourlyMinutes');
	}

	get getEverydayDays() {
		return this.fgCron.get('EverydayDays');
	}

	get getDailyEverydays() {
		return this.fgCron.get('DailyEverydays');
	}

	get getDailyEveryWeekDay() {
		return this.fgCron.get('DailyEveryWeekDay');
	}

	get getWeeklySat() {
		return this.fgCron.get('WeeklySat');
	}

	get getWeeklySun() {
		return this.fgCron.get('WeeklySun');
	}

	get getWeeklyMon() {
		return this.fgCron.get('WeeklyMon');
	}

	get getWeeklyTue() {
		return this.fgCron.get('WeeklyTue');
	}

	get getWeeklyWed() {
		return this.fgCron.get('WeeklyWed');
	}

	get getWeeklyThur() {
		return this.fgCron.get('WeeklyThur');
	}

	get getWeeklyFri() {
		return this.fgCron.get('WeeklyFri');
	}

	get getWeekly() {
		return this.fgCron.get('Weekly');
	}

	get getMonthlySpecificDayDay() {
		return this.fgCron.get('MonthlySpecificDayDay');
	}

	get getMonthlySpecificDayMonth() {
		return this.fgCron.get('MonthlySpecificDayMonth');
	}

	get getMonthlySpecificDay() {
		return this.fgCron.get('MonthlySpecificDay');
	}

	get getMonthlySpecificWeekDayMonthWeek() {
		return this.fgCron.get('MonthlySpecificWeekDayMonthWeek');
	}

	get getMonthlySpecificWeekDayDay() {
		return this.fgCron.get('MonthlySpecificWeekDayDay');
	}

	get getMonthlySpecificWeekDayMonth() {
		return this.fgCron.get('MonthlySpecificWeekDayMonth');
	}

	get getMonthlySpecificWeekDay() {
		return this.fgCron.get('MonthlySpecificWeekDay');
	}

	get getYearlySpecificMonthDayMonth() {
		return this.fgCron.get('YearlySpecificMonthDayMonth');
	}

	get getYearlySpecificMonthDayDay() {
		return this.fgCron.get('YearlySpecificMonthDayDay');
	}

	get getYearlySpecificMonthWeekMonthWeek() {
		return this.fgCron.get('YearlySpecificMonthWeekMonthWeek');
	}

	get getYearlySpecificMonthWeekDay() {
		return this.fgCron.get('YearlySpecificMonthWeekDay');
	}

	get getYearlySpecificMonthWeekMonth() {
		return this.fgCron.get('YearlySpecificMonthWeekMonth');
	}

	get getadvancedExpression() {
		return this.fgCron.get('advancedExpression');
	}

	public SubmitCron() {
		console.log(this.fgCron.value);
  }
  
  }
