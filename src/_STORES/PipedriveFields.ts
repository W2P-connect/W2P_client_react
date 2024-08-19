import { makeAutoObservable } from "mobx";
import { PipedriveField } from "Types";

class PipedriveFields {

    fileds: PipedriveField[] = []

    constructor() {
        makeAutoObservable(this);
        this.loadFields(); 
    }

    loadFields() {
        
    }

    addPipedriveField(pipedriveField: PipedriveField) {
        this.fileds.push(pipedriveField);
    }

    getPiepdriveField(id: number): PipedriveField | undefined {
        return this.fileds.find(field => field.id === id)
    }
}

export const todoStore = new PipedriveFields();
