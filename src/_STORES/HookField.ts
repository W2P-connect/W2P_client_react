import { makeAutoObservable, runInAction } from 'mobx';
import { BaseHookField, Block, HookField } from 'Types';
import { hookStore } from './Hooks'
import { pipedriveFieldsStore } from './PipedriveFields';
import { priorityFieldsKey, requiredFieldsKey } from 'appConstante';
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
        pipedriveFieldId: '',
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
            const hook = hookStore.hooks.find(hook => hook.id === field.hookId)

            if (!hook) return null

            const pipedriveField = pipedriveFieldsStore.getPipedriveField(field.pipedriveFieldId, hook.category);
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

    isImportant(hookField: HookField): boolean {
        const hook = hookStore.hooks.find(hook => hook.id === hookField.hookId)
        return (pipedriveFieldsStore.isFieldValid(hookField.pipedrive)
            && hook && priorityFieldsKey[hook.category]?.includes(hookField.pipedrive.field_code))
            ? true
            : false
    }

    isRequired(hookField: HookField): boolean {
        const hook = hookStore.hooks.find(hook => hook.id === hookField.hookId)
        if (hook && requiredFieldsKey[hook.category][hook.key]) {
            return requiredFieldsKey[hook.category][hook.key]?.includes(hookField.pipedrive.field_code)
        } else {
            return false
        }
    }

    hasValue(field: HookField): boolean {
        const value = field.value;

        if (typeof value === "number") {          
            return !isNaN(value) && value > 0;
        }

        if (typeof value === "boolean") {          
            return true;
        }

        if (typeof value === "string") {
            return value.trim().length > 0;
        }

        if (Array.isArray(value)) {
            if (typeof value[0] === "number") {
                return value.length > 0;
            }
            return (value as Block[]).some(block => block.variables.length > 0);
        }

        return false;
    }

}

export const hookFieldStore = new HookFieldStore();
