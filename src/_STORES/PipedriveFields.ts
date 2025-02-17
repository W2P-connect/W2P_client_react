import { makeAutoObservable, runInAction, toJS } from "mobx";
import { Category, PipedriveField } from "Types";
import { unusableFieldsKey } from "appConstante";
import { log } from "console";
import { deepCopy } from "helpers";

class PipedriveFieldStore {

    fields: PipedriveField[] = []

    constructor() {
        makeAutoObservable(this);
    }

    //Api call ?
    ressetPipedriveFields() {
        runInAction(() => {
            pipedriveFieldsStore.fields = []
        })
    }

    setPipedriveFields(pipedriveFields: PipedriveField[]) {
        runInAction(() => {
            this.fields = pipedriveFields
        })
    }

    getCategoryFields(category: Category) {
        return this.fields.filter(field => field.category === category)
    }

    addPipedriveFields(PipedriveFields: PipedriveField[]) {
        const fieldqNoDuplicate = deepCopy(this.fields).filter((existingField: PipedriveField) =>
            !PipedriveFields.some(newField =>
                newField.id === existingField.id && newField.category === existingField.category
            )
        );

        const fieldsToAdd = PipedriveFields.filter(field => this.isFieldValid(field));

        runInAction(() => {
            this.fields = deepCopy([...fieldqNoDuplicate, ...fieldsToAdd]);
        });

        return [...fieldqNoDuplicate, ...fieldsToAdd];
    }


    addPipedriveField(pipedriveField: PipedriveField) {
        if (!this.getPiepdriveField(pipedriveField.id, pipedriveField.category)) {
            runInAction(() => {
                this.fields.push(pipedriveField);
            })
        }
    }

    getPiepdriveField(id: number, category: Category): PipedriveField | undefined {
        return this.fields.find(field => field.id === id && field.category === category);
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
