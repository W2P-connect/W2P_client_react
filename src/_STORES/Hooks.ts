import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { BaseHookField, Category, Hook, HookField, PipedriveField, PreHook } from 'Types';
import { v4 as uuidv4 } from 'uuid';
import { pipedriveFieldsStore } from './PipedriveFields';
import { deepCopy } from 'helpers';

class HookStore {
    constructor() {
        makeAutoObservable(this);
    }

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


    emptyHook: Hook = {
        id: "",
        label: "",
        key: "",
        source: "user",
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

    selectedHookId: Hook["id"] | null = null

    selectHookId(id: Hook["id"] | null) {
        if (id) {
            runInAction(() => {
                const hook = this.getHook(id);
                this.selectedHookId = hook ? hook.id : null;
            });
        } else {
            runInAction(() => {
                this.selectedHookId = null;
            });
        }
    }


    addNewHook(hook: Hook) {
        runInAction(() => {
            this.hooks.push(hook)
        })
    }

    updateHook(id: string, updatedData: Partial<Hook>) {
        const hookIndex = this.hooks.findIndex(hook => hook.id === id);
        if (hookIndex > -1) {
            runInAction(() => {
                this.hooks[hookIndex] = { ...this.hooks[hookIndex], ...updatedData };
            })
        }
    }

    updateHookList(newHookList: Hook[]) {
        runInAction(() => {
            this.hooks = newHookList;
        })
    }

    getHookFromPreHook(preHook: PreHook, category: Category): Hook {
        const wantedHook = this.hooks.find(h => preHook.key === h.key && category === h.category);

        const hook = wantedHook
            ? this.getHook(wantedHook.id)
            : null

        if (hook) {
            return hook;
        } else {
            //Obligé de deepCopy sinon renvoie les mêmes fields pour tous les Hook o:
            const newHook = deepCopy({ ...this.emptyHook, ...preHook, category, id: uuidv4() });
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

        //Obligé de deepCopy sinon renvoie les mêmes fields pour tous les Hook o:
        return deepCopy(fields)
    }


    /********** HOOK FIELDS ***********/

    updateHookFieldsFromPipedriveFields(pipedriveFields: PipedriveField[]): void {
        this.hooks.forEach((hook, idx) => {
            this.addHookFieldsFromPipedrive(hook.id, pipedriveFields, idx)
        })
    }

    addHookFieldsFromPipedrive(hookId: string, pipedriveFields: PipedriveField[], hookIndex: number | null = null): void {
        const hookIdx = hookIndex
            ? hookIndex
            : hookStore.getHookIndex(hookId);
        if (hookIdx > -1) {
            pipedriveFields
                .forEach(pipedriveField => {
                    this.addHookField(hookId, pipedriveField, hookIdx)
                })
        }
    }

    addHookField(hookId: string, pipedriveField: PipedriveField, hookIndex?: number): HookField | null {
        if (pipedriveFieldsStore.isFieldValid(pipedriveField)) {
            const hIdx = hookIndex ?? hookStore.getHookIndex(hookId);

            const isExistingField = this.hooks[hIdx].fields.find(field => field.pipedriveFieldId === pipedriveField.id)

            if (!isExistingField) {
                const newHookField: HookField = {
                    ...this.emptyHookField,
                    id: uuidv4(),
                    pipedriveFieldId: pipedriveField.id,
                    pipedrive: pipedriveField,
                    hookId,
                };

                runInAction(() => {
                    this.hooks[hIdx].fields.push(deepCopy(newHookField)); // Ajouter une copie du nouveau champ
                    return newHookField;
                })
            } else {
                return null;
            }
        }
        return null;
    }


    getHookFieldFromPipedrive(hookId: Hook["id"], pipedriveFieldId: PipedriveField["id"]): HookField | null {
        const hook = hookStore.getHook(hookId);
        if (hook) {
            const hookField = hook.fields.find(hook => hook.pipedriveFieldId === pipedriveFieldId)
            if (hookField) {
                return this.formatHookField(hookField)
            } else {
                const pipedriveField = pipedriveFieldsStore.getPiepdriveField(pipedriveFieldId)
                return pipedriveField
                    ? this.addHookField(hookId, pipedriveField)
                    : null
            }
        } else {
            return null
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

    updateHookField(hook: Hook, fieldId: string, updatedData: Partial<HookField>): void {
        const hookIdx = this.getHookIndex(hook.id)
        if (hookIdx > -1) {
            const hookFieldIndex = this.hooks[hookIdx].fields.findIndex(hookField => hookField.id === fieldId);
            if (hookFieldIndex > -1) {
                runInAction(() => {
                    this.hooks[hookIdx].fields[hookFieldIndex] = { ...this.hooks[hookIdx].fields[hookFieldIndex], ...updatedData };
                })
            }
        }
    }
}

export const hookStore = new HookStore();
