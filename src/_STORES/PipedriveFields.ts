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
        this.fileds.push(pipedriveField);
    }

    getPiepdriveField(id: number): PipedriveField | undefined {
        return this.fileds.find(field => field.id === id)
    }

    static removeUnvalidFields = (pipedriveFieldsResponse: PipedriveField[]) => {
        const filteredResponse = pipedriveFieldsResponse
            .filter((field: PipedriveField) => PipedriveFieldStore.isFieldValid(field))
        return filteredResponse
    }

    static isFieldValid(field: PipedriveField): boolean {
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
