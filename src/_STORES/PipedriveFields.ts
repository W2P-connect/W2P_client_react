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
        console.log("getCategoryFields");
        return this.fields.filter(field => field.category === category)
    }

    addPipedriveFields(PipedriveFields: PipedriveField[]) {
        const fields = PipedriveFields.filter(field =>
            this.isFieldValid(field) && !this.getPiepdriveField(field.id)
        )

        console.log("PipedriveFields", PipedriveFields);


        runInAction(() => {
            console.log('New Pipedrive Fields :', fields);

            this.fields = [...this.fields, ...fields]
        })
    }

    addPipedriveField(pipedriveField: PipedriveField) {
        if (!this.getPiepdriveField(pipedriveField.id)) {
            console.log('New Pipedrive Field :', pipedriveField);

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
