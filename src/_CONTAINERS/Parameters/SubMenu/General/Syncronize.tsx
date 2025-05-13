import React, { FormEvent, useEffect, useState } from 'react'
import ProgressBar from '_COMPONENTS/GENERAL/ProgressBar/ProgressBar';
import { translate } from 'translation';
import { classNames, useCallApi } from 'helpers';
import { useNotification } from '_CONTEXT/hook/contextHook';
import { appDataStore } from '_STORES/AppData';
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.';

interface SyncData {
    running: boolean;
    sync_progress_users: number;
    sync_progress_orders: number;
    last_heartbeat: string;
    last_error: string;
    last_sinced_date: Date | null;
    sync_additional_datas: {
        total_users: number;
        current_user: number;
        total_orders: number;
        current_order: number;
        current_user_index: number;
        current_order_index: number;
        total_person_errors: number;
        total_person_uptodate: number;
        total_person_done: number;
        total_order_errors: number;
        total_order_uptodate: number;
        total_order_done: number;
    }
}

export const emptySyncData = {
    running: false,
    sync_progress_users: 0,
    sync_progress_orders: 0,
    last_heartbeat: "",
    last_error: "",
    sync_additional_datas: {
        total_users: 0,
        current_user: 0,
        total_orders: 0,
        current_order: 0,
        current_user_index: 0,
        current_order_index: 0,
        total_person_errors: 0,
        total_person_uptodate: 0,
        total_person_done: 0,
        total_order_errors: 0,
        total_order_uptodate: 0,
        total_order_done: 0,
    },
    last_sinced_date: null,
}

interface Props {
    checkPipedriveApi: (e: FormEvent, retry: boolean) => Promise<boolean>;
    checkW2pAPI: (e: FormEvent, retry: boolean) => Promise<boolean>;
}


export default function Syncronize({ checkPipedriveApi, checkW2pAPI }: Props) {

    const callApi = useCallApi()
    const { addNotification } = useNotification()

    const [syncData, setSyncData] = useState<SyncData>(emptySyncData)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchSyncProgress = async () => {
            try {
                const res = await callApi(
                    `${appDataStore.appData.w2pcifw_client_rest_url}/sync-progress`,
                    { method: "GET" },
                    null,
                    { time: new Date().getTime() }
                );
                if (res?.data) {
                    setSyncData(prv => ({
                        ...prv,
                        ...res.data,
                        last_sinced_date: res.data?.last_sinced_date ? new Date(res.data?.last_sinced_date) : null,
                    }));
                }
            } catch (error) {
                console.error("Error fetching sync progress:", error);
            }
        };

        fetchSyncProgress();

        let intervalId: NodeJS.Timeout;

        intervalId = setInterval(() => {
            fetchSyncProgress();
        }, syncData.running ? 5000 : 20 * 1000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [syncData.running]);

    const syncroniseAll = async (e: FormEvent, retry: boolean) => {
        e.preventDefault()
        if (window.confirm("Are you sure you have correctly configured your settings for the 'User Updated' hook and the order states? Please note that you will not be able to cancel the synchronization once it has started")) {

            const w2pOk = await checkW2pAPI(e, false)
            const pipeOk = await checkPipedriveApi(e, false)

            if (w2pOk && pipeOk) {
                setSyncData(prv => ({
                    ...prv,
                    running: false,
                    sync_progress_users: 0,
                    sync_progress_orders: 0,
                    last_heartbeat: "",
                    last_error: "",
                    sync_additional_datas: {
                        total_users: 0,
                        current_user: 0,
                        total_orders: 0,
                        current_order: 0,
                        current_user_index: 0,
                        current_order_index: 0,
                        total_person_errors: 0,
                        total_person_uptodate: 0,
                        total_person_done: 0,
                        total_order_errors: 0,
                        total_order_uptodate: 0,
                        total_order_done: 0,
                    },
                }))
                callApi(
                    `${appDataStore.appData.w2pcifw_client_rest_url}/start-sync`,
                    { method: "GET" },
                    null,
                    { "re-sync": true, "retry": retry, time: new Date().getTime() }
                )
                    .then(async res => {
                        setSyncData(prv => ({ ...prv, running: true }))
                        addNotification({
                            "error": !res?.data?.success,
                            "content": res?.data?.message
                                ? res.data.message
                                : res?.data?.success ? "Synchronization has started" : "Failed to start synchronization"
                        })
                    })
                    .catch(error => {
                        addNotification({
                            "error": true,
                            "content": translate("Wa have encountered an error, try again later")
                        })
                    })
            }
        }
    }

    return (
        <div>
            <h2>Synchronize all existing data with Pipedrive</h2>
            <p className='m-b-10'>{translate(`This action will synchronize all orders and users from your site with Pipedrive. To prevent system overload, the synchronization process may take several hours depending on the number of items being sent to Pipedrive.`)}</p>
            {syncData.running
                ? <div className='mt-4'>
                    <p>{translate("If the synchronization appears to be stuck for several minutes, you can try restarting it")}</p>
                    <form onSubmit={e => syncroniseAll(e, true)}>
                        <button className='mt-2'>
                            {translate("Restart Synchronization")}
                        </button>
                    </form>
                </div>
                : <>
                    <p className="mb-2">
                        {translate(`Before starting the synchronization, make sure you have properly configured the settings for the order and person hooks:`)}
                    </p>
                    <ul className="space-y-1 mb-6 text-muted-foreground text-sm list-disc list-inside">
                        <li className='pl-2'>
                            {translate(`During a full sync, the "User Updated" event is used to send user data to Pipedrive for persons and organizations (if defined). This hook is the most relevant for syncing general user information, as it is triggered anytime a user profile is updated — for example, after a new order or a profile change.`)}
                        </li>
                        <li className='pl-2'>
                            {translate(`For orders, the event corresponding to each order's current status (e.g., "Completed", "Processing") is used. Make sure you have configured those events under the "Deal" section if you want orders to be included in the sync.`)}
                        </li>
                    </ul>

                    {
                        syncData.last_error
                            ? <p className='text-red-700'>Error during sync: {syncData.last_error}</p>
                            : null
                    }
                    <div className='flex gap-1'>
                        <form onSubmit={e => !syncData.running && syncroniseAll(e, false)}>
                            <button
                                className={classNames(
                                    syncData.running ? "opacity-65 cursor-wait" : "",
                                    "mt-2"
                                )}
                            >
                                {translate("Synchronize all")}
                            </button>
                        </form>
                    </div>
                </>
            }

            {
                syncData.running || syncData.last_heartbeat
                    ? <div className='mt-4'>
                        <div >
                            <div className='mb-2'>
                                <Tooltip
                                    tooltipText={
                                        <div className='text-center'>
                                            {`Errors during sync: ${syncData.sync_additional_datas.total_person_errors}`}
                                        </div>
                                    }
                                    mainText={<div>Users and organizations synchronization progress {`${syncData.sync_additional_datas.current_user_index} / ${syncData.sync_additional_datas.total_users}`}</div>
                                    }
                                />
                            </div>
                            <ProgressBar completed={syncData.sync_progress_users} />
                        </div>
                        <div className='mt-4'>
                            <div className='mb-2'>
                                <Tooltip
                                    tooltipText={
                                        <div className='text-center'>
                                            {`Errors during sync: ${syncData.sync_additional_datas.total_order_errors}`}
                                        </div>
                                    }
                                    mainText={<div>Orders synchronization progress {`${syncData.sync_additional_datas.current_order_index} / ${syncData.sync_additional_datas.total_orders}`}</div>
                                    }
                                />
                            </div>
                            <ProgressBar completed={syncData.sync_progress_orders} />
                        </div>
                    </div>
                    : null
            }

            {
                syncData.last_sinced_date
                    ? <div className='mt-4'>
                        <span className='font-semibold'>Last syncronisation : </span>
                        {syncData.last_sinced_date.toLocaleString()}
                    </div>
                    : null
            }</div>
    )
}
