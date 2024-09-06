import { makeAutoObservable, runInAction } from 'mobx';
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

    dataCache = new Map();

    emptyHookField: BaseHookField = {
        id: '',
        enabled: false,
        value: 0,
        condition: {
            logicBlock: {
                enabled: false,
                fieldNumber: '1'
            }
        },
        pipedriveFieldId: 0,
        hookId: ''
    };

    baseHookFields: BaseHookField[] = []

    invalidateCache() {
        this.dataCache.clear();
    }


    getHookFieldFromId(id: HookField["id"] | BaseHookField["id"]): BaseHookField | null {
        return this.baseHookFields.find(hook => hook.id === id) ?? null
    }

    addNewHookField(hookField: HookField): void {
        runInAction(() => {
            this.baseHookFields.push(hookField)
        })
    }

    updateHookField(id: string, updatedData: Partial<HookField>): void {
        const hookFieldIndex = this.baseHookFields.findIndex(hookField => hookField.id === id);
        if (hookFieldIndex > -1) {
            this.baseHookFields[hookFieldIndex] = { ...this.baseHookFields[hookFieldIndex], ...updatedData };
        }
    }

    getData(hookFieldId: BaseHookField["id"]): HookField | null {
        if (this.dataCache.has(hookFieldId)) {
            return this.dataCache.get(hookFieldId);
        }

        const field = this.getHookFieldFromId(hookFieldId);
        if (field) {
            const pipedriveField = pipedriveFieldsStore.getPiepdriveField(field.pipedriveFieldId);
            const result = pipedriveField
                ? {
                    ...field,
                    pipedrive: pipedriveField,
                }
                : null;

            this.dataCache.set(hookFieldId, result);
            return result;
        } else {
            return null;
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
            const hook = hookStore.getHook(hookFieldData.hookId)
            return (pipedriveFieldsStore.isFieldValid(hookFieldData.pipedrive)
                && hook && priorityFieldsKey[hook.category]?.includes(hookFieldData.pipedrive.key))
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
