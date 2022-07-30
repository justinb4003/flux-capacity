import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TimeEntry } from 'src/app/shared/models/TimeEntry.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss']
})
export class MainScreenComponent implements OnInit, AfterViewInit {

  public clients: string[] = [
      'OurAbility',
      'Acrisure',
      'Internal',
      'FirstGroup',
    ];

  public tasks: string[] = [];

  public entries: TimeEntry[] = [];

  public filteredClients: Observable<string[]>;
  
  public filteredTasks: Observable<string[]>;

  public taskRunning: boolean = false;
  
  public inputClient = new FormControl('');
  
  public inputTask = new FormControl('');

  constructor() { 
    this.filteredClients = of(this.clients);
    this.filteredTasks = of(this.tasks);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.filteredClients = this.inputClient.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClients(value || '')),
    );
    
    this.filteredTasks = this.inputClient.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTasks(value || '')),
    );

  }

  private _filterClients(value: string): string[] {
    const filterValue = value.toLowerCase();
    const ret = this.clients.filter(client => client.toLowerCase().includes(filterValue));
    return ret;
  }
  
  private _filterTasks(value: string): string[] {
    const filterValue = value.toLowerCase();
    const ret = this.tasks.filter(client => client.toLowerCase().includes(filterValue));
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
    const te: TimeEntry = {
      entryUuid: uuidv4(),
      startTime: new Date(),
      endTime: null,
      client,
      task,
    };

    this.entries.push(te);
  }

  private endTask(): void {

  }

  public startEntry($event: any, entryUuid: string): void {
    console.log('restarting', entryUuid);

  }

  get actionButtonLabel(): string {
    return this.taskRunning ? 'Stop' : 'Start';
  }
}
