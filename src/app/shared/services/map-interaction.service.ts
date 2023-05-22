import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class MapInteractionService {
    private tableToMap = new Subject<{id: string, end: boolean}>();
    public tableToMap$ = this.tableToMap.asObservable();

    private mapToTable = new Subject<{id: string, end: boolean}>();
    public mapToTable$ = this.mapToTable.asObservable();

    constructor() {}

    public sendToMap(id: string, end: boolean) {
        this.tableToMap.next({id, end});
    }

    public sendToTable(id: string, end: boolean) {
        this.mapToTable.next({id, end});
    }
}