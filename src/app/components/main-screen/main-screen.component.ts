import {
  Component,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TimeEntry, TimeEntryLinked } from 'src/app/shared/models/TimeEntry.model';
import { v4 as uuidv4 } from 'uuid';
import { intervalToDuration, Duration } from 'date-fns';
import * as _ from 'lodash';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss'],
})
export class MainScreenComponent implements OnInit, AfterViewInit {
  public clients: string[] = [
    'OurAbility',
    'Acrisure',
    'Internal',
    'FirstGroup',
  ];

  public tasks: string[] = [];

  public entries: TimeEntry[] = [
    {
      // entryUuid: uuidv4(),
      client: 'Test 1',
      task: 'Testing',
      startTime: new Date(2022, 6, 30, 13, 0),
      endTime: new Date(2022, 6, 30, 14, 15),
    } as TimeEntry,
    {
      // entryUuid: uuidv4(),
      client: 'Test 2',
      task: 'Implement something',
      startTime: new Date(2022, 6, 30, 14, 15),
      endTime: new Date(2022, 6, 30, 14, 59),
    } as TimeEntry,
    {
      // entryUuid: uuidv4(),
      client: 'Test 1',
      task: 'Testing',
      startTime: new Date(2022, 6, 30, 14, 59),
      endTime: new Date(2022, 6, 30, 16, 28),
    } as TimeEntry,
  ];

  public filteredClients: Observable<string[]>;

  public filteredTasks: Observable<string[]>;

  public taskRunning: boolean = false;

  public taskRunningUuid: string = '';

  public inputClient = new FormControl('');

  public inputTask = new FormControl('');

  constructor() {
    this.entries.forEach((e) => {
      e.entryUuid = uuidv4();
    });
    this.filteredClients = of(this.clients);
    this.filteredTasks = of(this.tasks);
  }

  ngOnInit(): void {
    const self = this;
  }

  ngAfterViewInit(): void {
    this.filteredClients = this.inputClient.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterClients(value || '')),
    );

    this.filteredTasks = this.inputClient.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterTasks(value || '')),
    );
  }

  private filterClients(value: string): string[] {
    const filterValue = value.toLowerCase();
    const ret = this.clients.filter((client) => client.toLowerCase().includes(filterValue));
    return ret;
  }

  private filterTasks(value: string): string[] {
    const filterValue = value.toLowerCase();
    const ret = this.tasks.filter((task) => task.toLowerCase().includes(filterValue));
    return ret;
  }

  public actionButton(): void {
    const client = this.inputClient.value;
    const task = this.inputTask.value;
    console.log('client', client);
    console.log('task', task);

    this.taskRunning = !this.taskRunning;
    if (this.taskRunning) {
      this.inputClient.disable();
      this.inputTask.disable();
      this.startTask();
    } else {
      this.inputClient.enable();
      this.inputTask.enable();
      this.endTask();
    }
  }

  private startTask(): void {
    const client = this.inputClient.value || '';
    const task = this.inputTask.value || '';
    this.taskRunningUuid = uuidv4();
    const te: TimeEntry = {
      entryUuid: this.taskRunningUuid,
      startTime: new Date(),
      endTime: null,
      client,
      task,
    };

    this.entries.push(te);
  }

  private endTask(): void {
    const t = this.entries.find((e) => e.entryUuid === this.taskRunningUuid)!;
    t.endTime = new Date();
    this.taskRunningUuid = '';
  }

  public startEntry($event: any, entryUuid: string): void {
    console.log('restarting', entryUuid);
    if (this.taskRunning === true) {
      // End the currently running task.
      this.endTask();
    }
    const t = this.entries.find((e) => e.entryUuid === entryUuid)!;
    const newEntry: TimeEntry = {
      entryUuid: uuidv4(),
      task: t.task,
      client: t.client,
      startTime: new Date(),
      endTime: null,
    } as TimeEntry;
    this.entries.push(newEntry);
    this.taskRunningUuid = newEntry.entryUuid;
    this.taskRunning = true;
    this.inputClient.setValue(t.client);
    this.inputTask.setValue(t.task);
  }

  public editEntry($event: any, entryUuid: string): void {

  }

  public deleteEntry($event: any, entryUuid: string): void {

  }

  public calcTimeEntryDuration(te: TimeEntry): Duration {
    return intervalToDuration({ start: te.startTime, end: te.endTime || new Date() });
  }

  get actionButtonLabel(): string {
    return this.taskRunning ? 'Stop' : 'Start';
  }

  public subEntries(parentEntryUuid: string): TimeEntryLinked[] {
    return this.sortedEntries.filter((se) => se.parentEntryUuid === parentEntryUuid);
  }

  get sortedEntries(): TimeEntryLinked[] {
    // console.log('sorted entries running');
    const tmpEntries = _.orderBy(this.entries, ['startTime'], ['desc']);
    const ret: TimeEntryLinked[] = [];
    tmpEntries.forEach((e) => {
      const ne = e as TimeEntryLinked;
      ne.parentEntryUuid = null;
      ret.push(ne);
    });

    /* eslint no-param-reassign: ["error", { "props": false }] */
    ret.forEach((e) => {
      ret
        .filter(
          (te) => te.startTime < e.startTime
            && te.startTime.getFullYear() === e.startTime.getFullYear()
            && te.startTime.getMonth() === e.startTime.getMonth()
            && te.startTime.getDay() === e.startTime.getDay()
            && te.client === e.client
            && te.task === e.task
            && te.parentEntryUuid == null,
        )
        .forEach((de) => {
          de.parentEntryUuid = e.entryUuid;
        });
    });
    return ret;
  }

  public dumpDebug(): void {
    console.log(this.sortedEntries);
  }
}

export default MainScreenComponent;
