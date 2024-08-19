import { makeAutoObservable } from 'mobx';
import { appDataStore } from './AppData';
import { Category, Hook, HookField } from 'Types';
import { v4 as uuidv4 } from 'uuid';
import { pipedriveFieldsStore } from './PipedriveFields';

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
        active: false,
        category: "person",
        createActivity: false,
        fields: [],
    };

    hooks: Hook[] = []

    setOptionHook(newHook: Hook) {
        const updatedHookList = appDataStore.appData.parameters.w2p.hookList.map(hook =>
            newHook.id === hook.id ? newHook : hook
        );
        appDataStore.updateHookList(updatedHookList);
    }

    addNewHook(hook: Hook) {
        const updatedHookList = [...appDataStore.appData.parameters.w2p.hookList, hook];
        appDataStore.updateHookList(updatedHookList);
    }

    getHookFromParent(hook: Hook, category: Category): Hook {
        const wantedHook = appDataStore.appData.parameters.w2p.hookList.find(
            (h: Hook) => hook.key === h.key && category === h.category
        );

        if (wantedHook) {
            const fields = wantedHook.fields.map(hookField => {
                const pipedriveField = appDataStore.getPipedriveField(wantedHook.category, hookField.id);
                return pipedriveField ? { ...hookField, ...pipedriveField } : null;
            }).filter(Boolean);

            return { ...wantedHook, fields: fields as HookField[] };
        } else {
            const newHook = { ...this.emptyHook, ...hook, category, id: uuidv4() };
            this.addNewHook(newHook);
            return newHook;
        }
    }

    getHook(id: string): Hook | null {
        const wantedHook = this.hooks.find(hook => hook.id === id)
        if (wantedHook) {
            const fields = wantedHook.fields.map(hookField => {
                //Permet de toujours garder les fields pipedrive à jour si il y a un update sur Pipedrive
                const pipedriveFields = pipedriveFieldsStore.getPiepdriveField(hookField.pipedriveFieldId);
                return pipedriveFields
                    ? { ...hookField, ...pipedriveFields }
                    : null;
            }).filter(Boolean);

            return { ...wantedHook, fields: fields as HookField[] };
        }
        return null;
    }
}

export const hookStore = new HookStore();
