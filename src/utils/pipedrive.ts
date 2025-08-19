import { appDataStore } from "_STORES/AppData"
import { useCallPipedriveApi } from "./helpers"

export const useLoadPipedriveUsers = () => {

    const callPipedriveApi = useCallPipedriveApi()

    const loadPipedriveUsers = (e: React.FormEvent) => {
        callPipedriveApi("users", null, null, null, e)
            .then(res => {
                if (res) {
                    const newAppDataStore = appDataStore.appData
                    newAppDataStore.parameters.pipedrive.users = res.data.data
                    appDataStore.setAppData(newAppDataStore)
                }
            })
    }

    return loadPipedriveUsers
}

export const useLoadPipedriveActivitys = () => {

    const callPipedriveApi = useCallPipedriveApi()

    const loadActivityTypes = (e: React.FormEvent) => {
        callPipedriveApi("activityTypes", null, null, null, e)
            .then(res => {
                if (res) {
                    const newAppDataStore = appDataStore.appData
                    newAppDataStore.parameters.pipedrive.activityTypes = res.data.data
                    appDataStore.setAppData(newAppDataStore)
                }
            })
    }
    return loadActivityTypes
}