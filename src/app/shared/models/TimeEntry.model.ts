export interface TimeEntry {
    entryUuid: string;
    startTime: Date;
    endTime: Date | null;
    client: string;
    task: string;
}