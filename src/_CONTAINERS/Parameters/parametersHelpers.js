import { useContext } from "react"
import { AppDataContext } from "../../_CONTEXT/appDataContext"
import { v4 as uuidv4 } from 'uuid';

export const usePipedriveFields = () => {

    const formatPipedriveFields = (pipedriveFieldsResponse) => {
        const filteredResponse = pipedriveFieldsResponse
            .filter(field => field.id)
            .filter(field => field.bulk_edit_allowed)
            .filter(field => !unusableFieldsKey.includes(field.key))
        return filteredResponse
    }

    return { formatPipedriveFields }
}

export const useHookSelector = () => {
    const { appData, setAppData } = useContext(AppDataContext)

    const emptyHook = {
        id: "",
        label: "",
        key: "",
        description: "",
        active: false,
        show: false,
        fields: [],
    }

    /************************* HOOK INITIALISATION  **************************/

    const setOptionHook = (newHook) => {
        setAppData(prvAppData => {
            const newAppData = prvAppData
            newAppData.parameters.w2p.hookList =
                newAppData.parameters.w2p.hookList.map(hook =>
                    newHook.id === hook.id
                        ? newHook
                        : hook
                )
            return { ...newAppData }
        })
    }

    const addNewHook = (hook) => {
        setAppData(prvAppData => {
            const newAppData = prvAppData
            newAppData.parameters.w2p.hookList =
                [...newAppData.parameters.w2p.hookList, hook]
            return newAppData
        })
    }

    const getHookFromParent = (hook, category) => {
        const wantedHook = appData.parameters.w2p.hookList.find(h => hook.key === h.key && category === h.category)

        if (wantedHook) {
            const fields = wantedHook.fields
                .map(hookField => {
                    const updatedPipedriveField = getPipedriveField(wantedHook.category, hookField.id)
                    return updatedPipedriveField
                        ? { ...hookField, ...updatedPipedriveField }
                        : null
                })
                .filter(field => field)

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

        const wantedHook = appData.parameters.w2p.hookList.find(hook => id === hook.id)

        if (wantedHook) {
            const fields = wantedHook.fields
                .map(hookField => {
                    const updatedPipedriveField = getPipedriveField(wantedHook.category, hookField.id)
                    return updatedPipedriveField
                        ? { ...hookField, ...updatedPipedriveField }
                        : null
                })
                .filter(field => field)

            return { ...wantedHook, fields: fields }

        } else {
            return null
        }
    }

    /************************* HOOK FIELDS  **************************/
    const emptyHookField = {
        enabled: false,
        id: '',
        key: '',
        value: "",
        condition: "",
        field_type: "",
        options: null,
    }

    const addNewHookField = (hookId, newField) => {
        const hook = getHook(hookId)
        if (hook) {
            setAppData(prvAppData => {
                const newAppData = prvAppData
                newAppData.parameters.w2p.hookList =
                    newAppData.parameters.w2p.hookList.map(
                        hook => hook.id === hookId
                            ? { ...hook, fields: [...hook.fields, newField] }
                            : hook
                    )
                return newAppData
            })
        }
    }

    const getHookFieldFromPipedrive = (hookId, pipedriveFieldId) => {
        const hook = getHook(hookId)

        if (hook) {

            const field = hook.fields.find(field => field.id === pipedriveFieldId)
            const pipedriveField =
                appData.parameters.pipedrive[`${hook.category}Fields`]
                    .find(field => field.id === pipedriveFieldId)

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

    const getPipedriveField = (category, fieldId) => {
        return appData.parameters.pipedrive[`${category}Fields`].find(field => field.id === fieldId) ?? null
    }

    //ICI PRB
    const setHookField = (hookId, newField) => {
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

const unusableFieldsKey = [
    "id", "org_id", "people_count", "open_deals_count", "add_time", "update_time", "visible_to"
]

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
}

export const isLogicBlockField = (field) => {
    return isFieldTypeText(field.field_type)
        || field.field_type === "date"
        || isFieldTypeNumber(field.field_type)
} 