import { makeAutoObservable, runInAction } from "mobx";
import { Category, PipedriveField } from "Types";
import { unusableFieldsKey } from "appConstante";
import { deepCopy } from "utils/helpers";

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
                newField.field_code === existingField.field_code && newField.category === existingField.category
            )
        );

        const fieldsToAdd = PipedriveFields.filter(field => this.isFieldValid(field));

        runInAction(() => {
            this.fields = deepCopy([...fieldqNoDuplicate, ...fieldsToAdd]);
        });

        return [...fieldqNoDuplicate, ...fieldsToAdd];
    }


    addPipedriveField(pipedriveField: PipedriveField) {
        if (!this.getPipedriveField(pipedriveField.field_code, pipedriveField.category)) {
            runInAction(() => {
                this.fields.push(pipedriveField);
            })
        }
    }

    getPipedriveField(field_code: string, category: Category): PipedriveField | undefined {
        return this.fields.find(field => field.field_code === field_code && field.category === category);
    }

    removeUnvalidFields = (pipedriveFieldsResponse: PipedriveField[]) => {
        const filteredResponse = pipedriveFieldsResponse
            .filter((field: PipedriveField) => this.isFieldValid(field))
        return filteredResponse
    }

    isFieldValid(field: PipedriveField): boolean {
        return (!field.is_optional_response_field && field.field_code && !unusableFieldsKey.includes(field.field_code) && field.category)
            ? true
            : false
    }
}

const pipedriveFieldsStore = new PipedriveFieldStore();


export {
    pipedriveFieldsStore,
    PipedriveFieldStore
}
