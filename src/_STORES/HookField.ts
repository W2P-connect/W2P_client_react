import { makeAutoObservable } from 'mobx';
import { BaseHookField, Hook, HookField } from 'Types';
import { hookStore } from './Hooks'
import { pipedriveFieldsStore } from './PipedriveFields';

class HookFieldStore {

    constructor() {
        makeAutoObservable(this);
    }

    emptyHookField: BaseHookField = {
        enabled: false,
        key: '',
        value: '',
        condition: '',
        pipedriveFieldId: 0,
        hookId: ''
    };

    hookFields: BaseHookField[] = []


    addHookField(hookId: string, pipedriveFieldId: number, hookField = this.emptyHookField) {
        const newHookField = { ...this.emptyHookField, pipedriveFieldId, hookId }
        this.hookFields.push(newHookField)
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

    getHook(id: string): Hook | null {
        return hookStore.getHook(id)
    }
}

export const hookFieldStore = new HookFieldStore();
