import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { BaseHookField, Category, Hook, HookField, PipedriveField, PreHook } from 'Types';
import { v4 as uuidv4 } from 'uuid';
import { pipedriveFieldsStore } from './PipedriveFields';
import { deepCopy } from 'helpers';

interface HookDefaults {
    [key: string]: {
        [key: string]: {
            value: BaseHookField["value"];
            condition: Partial<BaseHookField["condition"]>;
        }
    };
}
class HookStore {
    constructor() {
        makeAutoObservable(this);
    }

    defaultHookSettings: Record<Category, HookDefaults> = {
        deal: {
            "woocommerce_new_order": {
                "status": {
                    value: "open",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_update_order": {} //activation pour les produits
            ,
            "woocommerce_order_status_on-hold": {
                "status": {
                    value: "open",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_order_status_pending": {
                "status": {
                    value: "open",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_order_status_processing": {
                "status": {
                    value: "won",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_order_status_completed": {
                "status": {
                    value: "won",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_order_status_refunded": {
                "status": {
                    value: "lost",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_order_status_cancelled": {
                "status": {
                    value: "lost",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
            "woocommerce_order_status_failed": {
                "status": {
                    value: "lost",
                    condition: {
                        SkipOnExist: false
                    }
                },
            },
        },
        organization: {
            "profile_update": {
                "name": {
                    value: [
                        {
                            variables: [
                                {
                                    value: "billing_company",
                                    source: "user",
                                    exemple: "ABC Corp",
                                    isFreeField: false,
                                    id: "3e59362e-3cd3-4c6c-8aec-a0d350b6ab8f"
                                }
                            ],
                            id: "02e6fddc-974f-4a7f-bac3-d4539bfd3177",
                            index: 0
                        }
                    ],
                    condition: {
                        logicBlock: {
                            enabled: true,
                            fieldNumber: "ALL"
                        },
                        SkipOnExist: false,
                        findInPipedrive: true
                    }
                },
                "adress": {
                    value: [
                        {
                            variables: [
                                {
                                    value: "billing_address_1",
                                    source: "user",
                                    exemple: "123 Main Street",
                                    isFreeField: false,
                                    id: "991e0668-a0ad-4b36-9070-3bed461e1bb3"
                                },
                                {
                                    value: "billing_address_2",
                                    source: "user",
                                    exemple: "Apt 4B",
                                    isFreeField: false,
                                    id: "8bd80dba-d034-480a-bcf8-fbbaf2dd275d"
                                },
                                {
                                    value: "billing_city",
                                    source: "user",
                                    exemple: "Cityville",
                                    isFreeField: false,
                                    id: "47971b56-754b-4cf9-a7a0-b26282b21f96"
                                },
                                {
                                    value: "billing_postcode",
                                    source: "user",
                                    exemple: "12345",
                                    isFreeField: false,
                                    id: "16092e20-e7a5-4edf-8aef-56a7eca84045"
                                },
                                {
                                    value: "billing_country",
                                    source: "user",
                                    exemple: "US",
                                    isFreeField: false,
                                    id: "26d81d32-0b07-4f86-af59-d075ae949d22"
                                },
                                {
                                    value: "billing_state",
                                    source: "user",
                                    exemple: "CA",
                                    isFreeField: false,
                                    id: "6a7394b0-078c-4031-87f6-d9d5762e9cd0"
                                }
                            ],
                            "id": "5e117c71-67c0-471f-a0e1-4f1e8f215bf9",
                            "index": 0
                        }
                    ],
                    condition: {
                        "logicBlock": {
                            "enabled": true,
                            "fieldNumber": "1"
                        },
                        "SkipOnExist": true
                    }
                }
            }

        },
        person: {
            "user_register": {
                "name": {
                    value: [
                        {
                            "variables": [
                                {
                                    "value": "first_name",
                                    "source": "user",
                                    "exemple": "John",
                                    "isFreeField": false,
                                    "id": "9f6bb149-9881-4029-ae51-ece68ce7fb15"
                                },
                                {
                                    "value": "last_name",
                                    "source": "user",
                                    "exemple": "Doe",
                                    "isFreeField": false,
                                    "id": "d90d63b5-5536-4055-b69e-04292204ecc6"
                                }
                            ],
                            "id": "95ac6390-03ed-4586-8c82-5c75c2e85ed7",
                            "index": 0
                        },
                        {
                            "variables": [
                                {
                                    "value": "billing_first_name",
                                    "source": "user",
                                    "exemple": "John",
                                    "isFreeField": false,
                                    "id": "51aff9bd-d8d0-4eb8-906d-c9252f69f75b"
                                },
                                {
                                    "value": "billing_last_name",
                                    "source": "user",
                                    "exemple": "Doe",
                                    "isFreeField": false,
                                    "id": "f8c6de80-9964-46bd-b88a-c70e306b457b"
                                }
                            ],
                            "id": "a19ae5c7-74cd-4864-a15c-a86cccb3f793",
                            "index": 1
                        }
                    ],
                    condition: {
                        "logicBlock": {
                            "enabled": true,
                            "fieldNumber": "ALL"
                        },
                        "findInPipedrive": true,
                        "SkipOnExist": true
                    },
                },
                "email": {
                    value: [
                        {
                            "variables": [
                                {
                                    "value": "user_email",
                                    "source": "user",
                                    "exemple": "john.doe@exemple.com",
                                    "isFreeField": false,
                                    "id": "062a38fc-9bfa-4188-a066-2d90093e9e74"
                                }
                            ],
                            "id": "37659736-d9d3-448f-b693-810c777a4d61",
                            "index": 0
                        }
                    ],
                    condition: {
                        "logicBlock": {
                            "enabled": false,
                            "fieldNumber": "1"
                        },
                        "findInPipedrive": true,
                        "SkipOnExist": false
                    },
                }
            },
            "profile_update": {
                "name": {
                    value: [
                        {
                            "variables": [
                                {
                                    "value": "first_name",
                                    "source": "user",
                                    "exemple": "John",
                                    "isFreeField": false,
                                    "id": "9f6bb149-9881-4029-ae51-ece68ce7fb15"
                                },
                                {
                                    "value": "last_name",
                                    "source": "user",
                                    "exemple": "Doe",
                                    "isFreeField": false,
                                    "id": "d90d63b5-5536-4055-b69e-04292204ecc6"
                                }
                            ],
                            "id": "95ac6390-03ed-4586-8c82-5c75c2e85ed7",
                            "index": 0
                        },
                        {
                            "variables": [
                                {
                                    "value": "billing_first_name",
                                    "source": "user",
                                    "exemple": "John",
                                    "isFreeField": false,
                                    "id": "51aff9bd-d8d0-4eb8-906d-c9252f69f75b"
                                },
                                {
                                    "value": "billing_last_name",
                                    "source": "user",
                                    "exemple": "Doe",
                                    "isFreeField": false,
                                    "id": "f8c6de80-9964-46bd-b88a-c70e306b457b"
                                }
                            ],
                            "id": "a19ae5c7-74cd-4864-a15c-a86cccb3f793",
                            "index": 1
                        }
                    ],
                    condition: {
                        "logicBlock": {
                            "enabled": true,
                            "fieldNumber": "ALL"
                        },
                        "findInPipedrive": true,
                        "SkipOnExist": true
                    },
                },
                "email": {
                    value: [
                        {
                            "variables": [
                                {
                                    "value": "user_email",
                                    "source": "user",
                                    "exemple": "john.doe@exemple.com",
                                    "isFreeField": false,
                                    "id": "062a38fc-9bfa-4188-a066-2d90093e9e74"
                                }
                            ],
                            "id": "37659736-d9d3-448f-b693-810c777a4d61",
                            "index": 0
                        }
                    ],
                    condition: {
                        "logicBlock": {
                            "enabled": false,
                            "fieldNumber": "1"
                        },
                        "findInPipedrive": true,
                        "SkipOnExist": false
                    },
                }
            }
        }
    };


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

            const existingField = this.hooks[hIdx].fields.find(field => field.pipedriveFieldId === pipedriveField.id)

            if (!existingField) {
                const newHookField: HookField = {
                    ...this.emptyHookField,
                    id: uuidv4(),
                    pipedriveFieldId: pipedriveField.id,
                    pipedrive: pipedriveField,
                    hookId,
                };

                runInAction(() => {
                    this.hooks[hIdx].fields.push(deepCopy(newHookField));
                    return newHookField;
                })
            } else {
                runInAction(() => {
                    this.hooks[hIdx].fields = this.hooks[hIdx].fields.map(field =>
                        field.pipedriveFieldId === pipedriveField.id
                            ? { ...field, pipedrive: deepCopy(pipedriveField) }
                            : field
                    );
                });

                return existingField;

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
