import { makeAutoObservable } from 'mobx';
import { BaseHookField, Hook, HookField } from 'Types';
import { hookStore } from './Hooks'
import { pipedriveFieldsStore, PipedriveFieldStore } from './PipedriveFields';
import { priorityFieldsKey } from 'appConstante';
import { v4 as uuidv4 } from 'uuid';

class HookFieldStore {

    constructor() {
        makeAutoObservable(this);
    }

    emptyHookField: BaseHookField = {
        id: '',
        enabled: false,
        key: '',
        value: '',
        condition: '',
        pipedriveFieldId: 0,
        hookId: ''
    };

    hookFields: BaseHookField[] = []


    addHookField(hookId: string, pipedriveFieldId: number, hookField = this.emptyHookField) {
        const newHookField = {
            ...this.emptyHookField,
            id: uuidv4(),
            pipedriveFieldId,
            hookId
        }
        this.hookFields.push(newHookField)
    }

    addNewHookField(hookField: HookField) {
        this.hookFields.push(hookField)
    }

    updateHookField(id: string, updatedData: Partial<HookField>) {
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
                    }
                    : null
            })
            .filter(field => field !== null)
    }

    isImportant(hookField: HookField) {
        const hook = hookStore.getHook(hookField.hookId)
        if (hook) {
            return PipedriveFieldStore.isFieldValid(hookField.pipedrive)
                && priorityFieldsKey[hook.category]?.includes(hookField.key)
        }
    }
}

export const hookFieldStore = new HookFieldStore();
