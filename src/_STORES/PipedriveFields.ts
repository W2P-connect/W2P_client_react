import { makeAutoObservable, runInAction } from "mobx";
import { Category, PipedriveField } from "Types";
import { unusableFieldsKey } from "appConstante";

class PipedriveFieldStore {

    fields: PipedriveField[] = []

    constructor() {
        makeAutoObservable(this);
        this.loadFields();
    }

    //Api call ?
    loadFields() {

    }

    getCategoryFields(category: Category) {
        return this.fields.filter(field => field.category === category)
    }

    addPipedriveFields(PipedriveFields: PipedriveField[]) {
        const fields = PipedriveFields.filter(field =>
            this.isFieldValid(field) && !this.getPiepdriveField(field.id)
        )

        runInAction(() => {
            this.fields = [...this.fields, ...fields]
        })

        return fields
    }

    addPipedriveField(pipedriveField: PipedriveField) {
        if (!this.getPiepdriveField(pipedriveField.id)) {
            runInAction(() => {
                this.fields.push(pipedriveField);
            })
        }
    }

    getPiepdriveField(id: number): PipedriveField | undefined {
        return this.fields.find(field => field.id === id)
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
