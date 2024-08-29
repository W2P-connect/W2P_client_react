import { makeAutoObservable, runInAction } from 'mobx';
import { appDataStore } from './AppData';
import { BaseHookField, Category, Hook, HookField, PreHook } from 'Types';
import { v4 as uuidv4 } from 'uuid';
import { hookFieldStore } from './HookField';

class HookStore {
    constructor() {
        makeAutoObservable(this);
    }

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


    setOptionHook(newHook: Hook) {
        const updatedHookList = appDataStore.appData.parameters.w2p.hookList.map(hook =>
            newHook.id === hook.id ? newHook : hook
        );
        appDataStore.updateHookList(updatedHookList);
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

    getFields(hookId: string): HookField[] {
        const fields = hookFieldStore.getHookFields(hookId)

        return fields
    }
}

export const hookStore = new HookStore();
