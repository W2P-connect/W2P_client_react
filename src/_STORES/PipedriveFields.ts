import { makeAutoObservable } from "mobx";
import { Category, PipedriveField } from "Types";
import { unusableFieldsKey } from "appConstante";

class PipedriveFieldStore {

    fileds: PipedriveField[] = []

    constructor() {
        makeAutoObservable(this);
        this.loadFields();
    }

    //Api call ?
    loadFields() {

    }

    getCategoryFields(category: Category) {
        return this.fileds.filter(field => field.category === category)
    }

    addPipedriveField(pipedriveField: PipedriveField) {
        if (!this.getPiepdriveField(pipedriveField.id)) {
            console.log('New Pipedrive Field :', pipedriveField);

            this.fileds.push(pipedriveField);
        }
    }

    getPiepdriveField(id: number): PipedriveField | undefined {
        return this.fileds.find(field => field.id === id)
    }

    removeUnvalidFields = (pipedriveFieldsResponse: PipedriveField[]) => {
        const filteredResponse = pipedriveFieldsResponse
            .filter((field: PipedriveField) => this.isFieldValid(field))
        return filteredResponse
    }

    isFieldValid(field: PipedriveField): boolean {
        return (field.bulk_edit_allowed && field.id && !unusableFieldsKey.includes(field.key) && field.category)
            ? true
            : false
    }
}

const pipedriveFieldsStore = new PipedriveFieldStore();


export {
    pipedriveFieldsStore,
    PipedriveFieldStore
}
