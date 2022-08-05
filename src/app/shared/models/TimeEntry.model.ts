export interface TimeEntry {
  entryUuid: string;
  startTime: Date;
   endTime: Date | null;
  client: string;
    task: string;
}

export interface TimeEntryLinked extends TimeEntry {
    parentEntryUuid: string | null;
}
