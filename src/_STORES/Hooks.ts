import { makeAutoObservable, runInAction } from 'mobx';
import { appDataStore } from './AppData';
import { BaseHookField, Category, Hook, HookField, PipedriveField, PreHook } from 'Types';
import { v4 as uuidv4 } from 'uuid';
import { hookFieldStore } from './HookField';
import { pipedriveFieldsStore } from './PipedriveFields';

class HookStore {
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


    emptyHook: Hook = {
        id: "",
        label: "",
        key: "",
        disabledFor: [],
        description: "",
        show: false,
        enabled: false,
        option: {
            createActivity: false,
        },
        category: "person",
        fields: [],
    };

    hooks: Hook[] = []

    selectedHook: Hook | null = null

    selectHook(id: Hook["id"] | null) {
        if (id) {
            runInAction(() => {
                this.selectedHook = this.getHook(id)
            })
        } else {
            runInAction(() => {
                this.selectedHook = null
            })
        }
    }

    refreshSelectedHook() {
        runInAction(() => {
            this.selectedHook = this.selectedHook?.id
                ? this.getHook(this.selectedHook.id)
                : null
        })
    }


    addNewHook(hook: Hook) {
        runInAction(() => {
            this.hooks.push(hook)
        })
    }

    updateHook(id: string, updatedData: Partial<Hook>) {
        const hookIndex = this.hooks.findIndex(hook => hook.id === id);
        if (hookIndex > -1) {
            this.hooks[hookIndex] = { ...this.hooks[hookIndex], ...updatedData };
        }
    }

    getHookFromPreHook(preHook: PreHook, category: Category): Hook {
        const wantedHook = this.hooks.find(h => preHook.key === h.key && category === h.category);

        if (wantedHook) {
            const fields = this.getFields(wantedHook.id)
            return {
                ...wantedHook,
                fields: fields
            };
        } else {
            const newHook = { ...this.emptyHook, ...preHook, category, id: uuidv4() };
            this.addNewHook(newHook);
            return newHook;
        }
    }

    getHook(id: string): Hook | null {
        const wantedHook = this.hooks.find(hook => hook.id === id)
        if (wantedHook) {
            const fields = this.getFields(wantedHook.id)
            return { ...wantedHook, fields: fields };
        }
        return null;
    }

    getHookIndex(id: string): number {
        const wantedHookIndex = this.hooks.findIndex(hook => hook.id === id)
        return wantedHookIndex;
    }

    getFields(hookId: string): HookField[] {
        const hookIndex = this.getHookIndex(hookId)
        const fields = this.hooks[hookIndex].fields
            .map(field => this.formatHookField(field))
            .filter((field): field is HookField => field !== null)
        return fields
    }


    /********** HOOK FIELDS ***********/

    addHookFieldsFromPipedrive(hookId: string, pipedriveFields: PipedriveField[]): HookField[] | null {
        const hookIndex = hookStore.getHookIndex(hookId);
        if (hookIndex >= 0) {
            const hookFields = pipedriveFields.map(pipedriveField => {
                const newHookField: HookField = {
                    ...this.emptyHookField,
                    id: uuidv4(),
                    pipedriveFieldId: pipedriveField.id,
                    pipedrive: pipedriveField,
                    hookId,
                };
                runInAction(() => {
                    this.hooks[hookIndex].fields.push(newHookField);
                })
                console.log('[HookField] addHookField', newHookField);

                return newHookField
            })
            return hookFields
        }
        return null
    }

    getHookFieldFromPipedrive(hookId: Hook["id"], pipedriveFieldId: PipedriveField["id"]): HookField | null {
        console.log('[HookField] getHookFieldFromPipedrive');
        const hook = hookStore.getHook(hookId);
        if (hook) {
            const hookField = hook.fields.find(hook => hook.pipedriveFieldId === pipedriveFieldId)
            if (hookField) {
                return this.getHookFieldData(hook.id)
            } else {
                return this.addHookField(hookId, pipedriveFieldId)
            }
        }
    }

    formatHookField(field: BaseHookField | HookField): HookField | null {
        if ("pipedrive" in field) {
            return field;
        } else {
            const pipedriveField = pipedriveFieldsStore.getPiepdriveField(field.pipedriveFieldId);
            const formatedField = pipedriveField
                ? {
                    ...field,
                    pipedrive: pipedriveField,
                }
                : null;

            return formatedField
        }
    }

}

export const hookStore = new HookStore();
