import { useContext } from "react"
import { AppDataContext } from "../../_CONTEXT/appDataContext"
import { v4 as uuidv4 } from 'uuid';
import { unusableFieldsKey } from "../../appConstante";
import { AppData, Category, Field, Hook, HookField } from "../../../Types";

export const usePipedriveFields = () => {

    const formatPipedriveFields = (pipedriveFieldsResponse) => {
        const filteredResponse = pipedriveFieldsResponse
            .filter((field: Field) => field.id)
            .filter((field: Field) => field.bulk_edit_allowed)
            .filter((field: Field) => !unusableFieldsKey.includes(field.key))
        return filteredResponse
    }

    return { formatPipedriveFields }
}

export const useHookSelector = () => {
    const { appData, setAppData } = useContext(AppDataContext)

    const emptyHook: Hook = {
        id: "",
        label: "",
        key: "",
        description: "",
        active: false,
        show: false,
        fields: [],
    }

    /************************* HOOK INITIALISATION  **************************/

    const setOptionHook = (newHook: Hook) => {
        setAppData((prvAppData: AppData) => {
            const newAppData = prvAppData
            newAppData.parameters.w2p.hookList =
                newAppData.parameters.w2p.hookList.map(hook =>
                    newHook.id === hook.id
                        ? newHook
                        : hook
                )
            return newAppData
        })
    }

    const addNewHook = (hook: Hook) => {


        console.log("appData", appData);

        setAppData((prvAppData: AppData) => {
            const newAppData = prvAppData
            newAppData.parameters.w2p.hookList =
                [...newAppData.parameters.w2p.hookList, hook]
            return newAppData
        })
    }

    const getHookFromParent = (hook: Hook, category: Category) => {

        const wantedHook = appData.parameters.w2p.hookList.find((h: Hook) => hook.key === h.key && category === h.category)

        if (wantedHook) {
            const fields = wantedHook.fields
                .map((hookField: HookField) => {
                    const updatedPipedriveField = getPipedriveField(wantedHook.category, hookField.id)
                    return updatedPipedriveField
                        ? { ...hookField, ...updatedPipedriveField }
                        : null
                })
                .filter((field: HookField) => field)

            return { ...wantedHook, fields: fields }

        } else {
            const newHook = {
                ...emptyHook,
                ...hook,
                category: category,
                id: uuidv4(),
            }
            addNewHook(newHook)
            return newHook
        }
    }

    const getHook = (id) => {
        // return appData.parameters.w2p.hookList.find(hook => id === hook.id) ?? null

        console.log(appData.parameters.w2p.hookList);

        const wantedHook = appData.parameters.w2p.hookList.find((hook: Hook) => id === hook.id)

        if (wantedHook) {
            const fields = wantedHook.fields
                .map((hookField: HookField) => {
                    const updatedPipedriveField = getPipedriveField(wantedHook.category, hookField.id)
                    return updatedPipedriveField
                        ? { ...hookField, ...updatedPipedriveField }
                        : null
                })
                .filter((field: HookField) => field)

            return { ...wantedHook, fields: fields }

        } else {
            return null
        }
    }

    /************************* HOOK FIELDS  **************************/
    const emptyHookField: HookField = {
        enabled: false,
        id: '',
        key: '',
        value: "",
        condition: "",
        field_type: "",
        options: null,
    }

    const addNewHookField = (hookId: string, newField: HookField) => {
        const hook = getHook(hookId)
        if (hook) {
            setAppData((prvAppData: AppData) => {
                const newAppData = prvAppData
                newAppData.parameters.w2p.hookList =
                    newAppData.parameters.w2p.hookList.map(
                        (hook: Hook) => hook.id === hookId
                            ? { ...hook, fields: [...hook.fields, newField] }
                            : hook
                    )
                return newAppData
            })
        }
    }

    const getHookFieldFromPipedrive = (hookId: string, pipedriveFieldId: string) => {
        const hook = getHook(hookId)

        if (hook) {

            const field = hook.fields.find((field: HookField) => field.id === pipedriveFieldId)
            const pipedriveField =
                appData.parameters.pipedrive[`${hook.category}Fields`]
                    .find((field: HookField) => field.id === pipedriveFieldId)

            if (!field) {
                addNewHookField(hookId, { ...emptyHookField, ...pipedriveField })
            }

            return field
                ? field
                : { ...emptyHookField, ...pipedriveField }

        } else {
            return null
        }
    }

    const getPipedriveField = (category: Category, fieldId: string) => {
        return appData.parameters.pipedrive[`${category}Fields`].find((field: HookField) => field.id === fieldId) ?? null
    }

    //ICI PRB
    const setHookField = (hookId: string, newField: HookField) => {
        const hook = getHook(hookId)
        if (hook) {
            setOptionHook({
                ...hook,
                fields: hook.fields.map(field =>
                    field.id === newField.id
                        ? newField
                        : field
                )
            })
        }
    }

    return {
        setOptionHook,
        getHookFromParent,
        getHook,
        getHookFieldFromPipedrive,
        setHookField,
        getPipedriveField
    }
}

export const filterUnusableFields = (fieldList) => {
    return fieldList
}

export const isFieldTypeNumber = (fieldType) => {
    return fieldType === "monetary"
        || fieldType === "double"
        || fieldType === "int"
}

export const isFieldTypeText = (fieldType) => {
    return fieldType === "varchar"
        || fieldType === "address"
        || fieldType === "phone"
        || fieldType === "text"
        || fieldType === "varchar_options"
}

export const isLogicBlockField = (field) => {
    return isFieldTypeText(field.field_type)
        || field.field_type === "date"
        || isFieldTypeNumber(field.field_type)
} 