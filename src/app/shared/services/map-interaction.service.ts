import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class MapInteractionService {
    private tableToMap = new Subject<string>();
    public tableToMap$ = this.tableToMap.asObservable();

    private mapToTable = new Subject<string>();
    public mapToTable$ = this.mapToTable.asObservable();

    constructor() {}

    public sendToMap(id: string) {
        console.log("sendToMap", id);
        this.tableToMap.next(id);
    }

    public sendToTable(id: string) {
        console.log("sendToTable", id);
        this.mapToTable.next(id);
    }
}