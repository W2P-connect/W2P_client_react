import { useContext } from "react"
import { AppDataContext } from "../../_CONTEXT/appDataContext"
import { v4 as uuidv4 } from 'uuid';
import { unusableFieldsKey } from "appConstante";
import { AppData, Category, PipedriveField, Hook, HookField, PipedriveFieldType, BaseHookField } from "Types";
import { useAppDataContext } from "_CONTEXT/hook/contextHook";

export const usePipedriveFields = () => {

    const formatPipedriveFields = (pipedriveFieldsResponse: PipedriveField[]) => {
        const filteredResponse = pipedriveFieldsResponse
            .filter((field: PipedriveField) => field.id)
            .filter((field: PipedriveField) => field.bulk_edit_allowed)
            .filter((field: PipedriveField) => !unusableFieldsKey.includes(field.key))
        return filteredResponse
    }

    return { formatPipedriveFields }
}

export const useHookSelector = () => {
    const { appData, setAppData } = useAppDataContext()

    const emptyHook: Hook = {
        id: "",
        label: "",
        key: "",
        disabledFor: [],
        description: "",
        show: false,
        active: false,
        category: "person",
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

        setAppData((prvAppData: AppData) => {
            const newAppData = prvAppData
            newAppData.parameters.w2p.hookList =
                [...newAppData.parameters.w2p.hookList, hook]
            return newAppData
        })
    }

    const getHookFromParent = (hook: Hook, category: Category) => {

        const wantedHook: Hook | undefined = appData.parameters.w2p.hookList.find((h: Hook) => hook.key === h.key && category === h.category)

        if (wantedHook) {
            const fields: HookField[] = wantedHook.fields
                .map((hookField: HookField) => {
                    const pipedriveField: PipedriveField | null = getPipedriveField(wantedHook.category, hookField.id)
                    const formatedHookField: HookField | null = pipedriveField
                        ? { ...hookField, ...pipedriveField }
                        : null
                    return formatedHookField
                })
                .filter(field => field !== null);

            const hook: Hook = { ...wantedHook, fields: fields }
            return hook

        } else {
            const newHook: Hook = {
                ...emptyHook,
                ...hook,
                category: category,
                id: uuidv4(),
            }
            addNewHook(newHook)
            return newHook
        }
    }

    const getHook = (id: string) => {

        const wantedHook = appData.parameters.w2p.hookList.find((hook: Hook) => id === hook.id)

        if (wantedHook) {
            const fields: HookField = wantedHook.fields
                .map((hookField: HookField) => {
                    const updatedPipedriveField = getPipedriveField(wantedHook.category, hookField.id)
                    return updatedPipedriveField
                        ? { ...hookField, ...updatedPipedriveField }
                        : null
                })
                .filter((field: HookField | null) => field)

            const hook: Hook = { ...wantedHook, fields: fields }
            return hook

        } else {
            return null
        }
    }

    /************************* HOOK FIELDS  **************************/
    const emptyHookField: BaseHookField = {
        enabled: false,
        key: '',
        value: "",
        condition: "",
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

    const getHookFieldFromPipedrive = (hookId: string, pipedriveFieldId: number) => {
        const hook = getHook(hookId)

        if (hook) {

            const field: HookField | undefined = hook.fields.find((field: HookField) => field.id === pipedriveFieldId)

            const pipedriveField =
                appData.parameters.pipedrive[`${hook.category}Fields`]
                    .find((field: PipedriveField) => field.id === pipedriveFieldId)

            if (!pipedriveField) {
                return null
            }

            if (!field && pipedriveField) {
                addNewHookField(hookId, { ...emptyHookField, ...pipedriveField })
            }

            return field
                ? field
                : { ...emptyHookField, ...pipedriveField }

        } else {
            return null
        }
    }

    const getPipedriveField = (category: Category, fieldId: number): PipedriveField | null => {
        return appData.parameters.pipedrive[`${category}Fields`].find((field: PipedriveField) => field.id === fieldId) ?? null
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

export const filterUnusableFields = (fieldList: PipedriveField[]) => {
    return fieldList
}

export const isFieldTypeNumber = (fieldType: PipedriveFieldType) => {
    return fieldType === "monetary"
        || fieldType === "double"
        || fieldType === "int"
}

export const isFieldTypeText = (fieldType: PipedriveFieldType) => {
    return fieldType === "varchar"
        || fieldType === "address"
        || fieldType === "phone"
        || fieldType === "text"
        || fieldType === "varchar_options"
}

export const isLogicBlockField = (field: PipedriveField) => {
    return isFieldTypeText(field.field_type)
        || field.field_type === "date"
        || isFieldTypeNumber(field.field_type)
} 