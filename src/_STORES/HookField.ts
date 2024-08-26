import { makeAutoObservable } from 'mobx';
import { BaseHookField, HookField } from 'Types';
import { hookStore } from './Hooks'
import { pipedriveFieldsStore, PipedriveFieldStore } from './PipedriveFields';
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

    hookFields: BaseHookField[] = []


    addHookField(hookId: string, pipedriveFieldId: number, hookField: BaseHookField = this.emptyHookField): void {
        const newHookField = {
            ...hookField,
            id: uuidv4(),
            pipedriveFieldId,
            hookId
        }
        this.hookFields.push(newHookField)
    }

    addNewHookField(hookField: HookField) {
        this.hookFields.push(hookField)
    }

    updateHookField(id: string, updatedData: Partial<HookField>): void {
        const hookFieldIndex = this.hookFields.findIndex(hookField => hookField.id === id);
        if (hookFieldIndex > -1) {
            this.hookFields[hookFieldIndex] = { ...this.hookFields[hookFieldIndex], ...updatedData };
        }
    }

    getHookFields(hookId: string): HookField[] {
        return this.hookFields
            .filter(field =>
                field.hookId === hookId
            )
            .map(field => {
                const pipedriveField = pipedriveFieldsStore.getPiepdriveField(field.pipedriveFieldId)
                return pipedriveField
                    ? {
                        ...field,
                        pipedrive: pipedriveField
                    } as HookField
                    : null
            })
            .filter((field): field is HookField => field !== null)
    }

    isImportant(hookField: HookField): boolean {
        const hook = hookStore.getHook(hookField.hookId)
        if (hook) {
            return (PipedriveFieldStore.isFieldValid(hookField.pipedrive)
                && priorityFieldsKey[hook.category]?.includes(hookField.pipedrive.key))
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
