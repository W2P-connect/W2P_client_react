import { makeAutoObservable } from 'mobx';
import { BaseHookField, Hook, HookField, PipedriveField } from 'Types';
import { hookStore } from './Hooks'
import { pipedriveFieldsStore } from './PipedriveFields';
import { priorityFieldsKey } from 'appConstante';
import { v4 as uuidv4 } from 'uuid';
import { appDataStore } from './AppData';

class HookFieldStore {

    constructor() {
        makeAutoObservable(this);
    }

    emptyHookField: BaseHookField = {
        id: '',
        enabled: false,
        value: 0,
        condition: {
            enabled: false,
            fieldNumber: '1'
        },
        pipedriveFieldId: 0,
        hookId: ''
    };

    baseHookFields: BaseHookField[] = []


    addHookField(hookId: string, pipedriveFieldId: number, hookField: BaseHookField = this.emptyHookField): HookField | null {
        const pipedriveField = pipedriveFieldsStore.getPiepdriveField(pipedriveFieldId)
        const hook = hookStore.getHook(hookId)
        if (pipedriveField && hook) {
            const newBaseHookField: BaseHookField = {
                ...hookField,
                id: uuidv4(),
                pipedriveFieldId,
                hookId
            }
            this.baseHookFields.push(newBaseHookField)
            return this.getData(newBaseHookField.id)
        } else {
            return null
        }
    }

    getHookFieldFromPipedrive(hookId: Hook["id"], pipedriveFieldId: PipedriveField["id"]): HookField | null {
        const hook = this.baseHookFields.find(hook =>
            hook.pipedriveFieldId === pipedriveFieldId
            && hook.hookId === hookId
        )
        if (hook) {
            return this.getData(hook.id)
        } else {
            return this.addHookField(hookId, pipedriveFieldId)
        }
    }

    getHookFieldFromId(id: HookField["id"] | BaseHookField["id"]): BaseHookField | null {
        return this.baseHookFields.find(hook => hook.id === id) ?? null
    }

    addNewHookField(hookField: HookField): void {
        this.baseHookFields.push(hookField)
    }

    updateHookField(id: string, updatedData: Partial<HookField>): void {
        const hookFieldIndex = this.baseHookFields.findIndex(hookField => hookField.id === id);
        if (hookFieldIndex > -1) {
            this.baseHookFields[hookFieldIndex] = { ...this.baseHookFields[hookFieldIndex], ...updatedData };
        }
    }

    getData(hookFieldId: BaseHookField["id"]): HookField | null {
        const field = this.getHookFieldFromId(hookFieldId)
        if (field) {
            const pipedriveField = pipedriveFieldsStore.getPiepdriveField(field.pipedriveFieldId)
            const hook = hookStore.getHook(field.hookId)
            return pipedriveField && hook //On ne veut pas concerver les fields qui n'ont plus de hook ou de pipedrive
                ? {
                    ...field,
                    pipedrive: pipedriveField,
                    hook: hook
                }
                : null
        } else {
            return null
        }
    }

    getHookFields(hookId: string): HookField[] {
        return this.baseHookFields
            .filter(field =>
                field.hookId === hookId
            )
            .map(field => {
                const fieldData = this.getData(field.id)
                return fieldData
                    ? fieldData
                    : null
            })
            .filter((field): field is HookField => field !== null)
    }

    isImportant(hookField: HookField | BaseHookField): boolean {
        const hookFieldData = this.getData(hookField.id)
        if (hookFieldData) {
            return (pipedriveFieldsStore.isFieldValid(hookFieldData.pipedrive)
                && priorityFieldsKey[hookFieldData.hook.category]?.includes(hookFieldData.pipedrive.key))
                ? true
                : false
        } else {
            return false
        }
    }

    isRequired(hookField: HookField): boolean {
        const hook = hookStore.getHook(hookField.id)
        if (hook) {
            return appDataStore.appData.CONSTANTES.W2P_REQUIRED_FIELDS[hook.category].includes(hookField.pipedrive.key)
        } else {
            return false
        }
    }
}

export const hookFieldStore = new HookFieldStore();
