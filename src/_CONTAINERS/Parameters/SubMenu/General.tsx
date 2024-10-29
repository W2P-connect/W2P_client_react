import React, { FormEvent, useEffect, useState } from 'react'
import Input from '../../../_COMPONENTS/FORMS/INPUT/input/Input';
import { translate } from '../../../translation';
import { classNames, deepMerge, useCallApi, useCallPipedriveApi } from '../../../helpers';
import { appDataStore } from '_STORES/AppData';
import { useAppDataContext, useNotification } from '_CONTEXT/hook/contextHook';
import { observer } from 'mobx-react-lite';
import { runInAction, toJS } from 'mobx';
import { hookStore } from '_STORES/Hooks';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.';
import MainButton from '_COMPONENTS/GENERAL/MainButton/MainButton';
import { Category, HookField, PipedriveField } from 'Types';
import { error } from 'console';
import ProgressBar from '_COMPONENTS/GENERAL/ProgressBar/ProgressBar';

interface SyncData {
  running: boolean;
  sync_progress_users: number;
  sync_progress_orders: number;
  last_sinced_date: Date | null;
  sync_additional_datas: {
    total_users: number;
    current_user: number;
    current_user_index: number;
    total_orders: number;
    current_order: number;
    current_order_index: number;
  }
}

const Connexion = () => {

  const callPipedriveApi = useCallPipedriveApi()
  const callApi = useCallApi()

  const [syncData, setSyncData] = useState<SyncData>({
    running: false,
    sync_progress_users: 0,
    sync_progress_orders: 0,
    sync_additional_datas: {
      total_users: 0,
      current_user: 0,
      current_user_index: 0,
      total_orders: 0,
      current_order: 0,
      current_order_index: 0,
    },
    last_sinced_date: null,
  })

  const [endedNow, setEndedNow] = useState(false)

  useEffect(() => {
    const fetchSyncProgress = async () => {
      try {
        const res = await callApi(
          `${appDataStore.appData.w2p_client_rest_url}/sync-progress`,
          { method: "GET" },
          null,
          { time: new Date().getTime() }
        );
        if (res?.data) {

          if (!res.data.running && syncData.running) {
            setEndedNow(true)
          }
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

    if (syncData.running) {
      intervalId = setInterval(() => {
        fetchSyncProgress();
      }, 8000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [syncData.running]);



  const { saveParameters } = useAppDataContext()
  const { addNotification } = useNotification()

  const checkPipedriveApi = (e: FormEvent) => {
    e.preventDefault()
    callPipedriveApi("dealFields", null, null, null, e)
      .then(async _ => {
        addNotification({ error: false, content: translate("Connection to Pipedrive successful.") })
        await saveParameters(e, false)
      })
      .catch(_ => addNotification({ error: true, content: translate("Connection failed. Please check the API key or company domain.") }))
  }

  const checkW2pAPI = (e: FormEvent) => {
    e.preventDefault()
    callApi(`${appDataStore.appData.w2p_distant_rest_url}/authentification`, { method: 'get' }, null, {
      domain: appDataStore.appData.parameters.w2p.domain,
      api_key: appDataStore.appData.parameters.w2p.api_key,
    }, e)
      .then(async res => {
        addNotification({ error: false, content: translate(res?.data?.message) })
        await saveParameters(e, false)
      })
      .catch(res => {
        if (res?.response?.request?.status === 500) {
          addNotification({ error: true, content: translate("Our servers are under maintenance, please try again soon") })
        } else {
          addNotification({ error: true, content: translate(res?.response?.data?.message ?? 'An error occured') })
        }
      }
      )
  }

  const loadDefaultSettings = async (e: FormEvent) => {
    e.preventDefault()
    if (!appDataStore.appData.parameters.pipedrive.api_key || !appDataStore.appData.parameters.pipedrive.company_domain) {
      addNotification({ error: true, content: translate("To load the default settings, you need to provide your Pipedrive API key and your company domain.") })
      return
    }

    if (window.confirm(
      translate("Loading the default settings will overwrite some of your parameters. Do you wish to continue ?")
    )) {

      await loadAllPipedriveFields(e)

      setupHooks();

      const newAppDataStore = appDataStore.appData
      newAppDataStore.parameters.w2p.deal = appDataStore.defaultW2Pparameters.deal

      appDataStore.setAppData(newAppDataStore)
      saveParameters(e, false)
        .then(_ => addNotification({ error: false, content: translate("Default parameters loaded.") }))
    }
  }

  const loadAllPipedriveFields = async (e: FormEvent) => {
    try {
      const categories: Category[] = ["deal", "organization", "person"]
      const results = await Promise.all(categories.map(async (category) => {
        const res = await callPipedriveApi(`${category}Fields`, null, null, null);
        console.log(res?.data);

        if (!res?.data?.data) {
          throw new Error(`No data in Pipedrive response for category: ${category}`);
        }
        return res.data.data.map((field: PipedriveField) => ({
          ...field,
          category: category
        }));
      }));

      // Accumulez tous les champs retournés
      const allFields: PipedriveField[] = results.flat();

      // Injectez tous les champs accumulés dans le store
      pipedriveFieldsStore.addPipedriveFields(allFields);

      const defaultParametersCategories: Category[] = Object.keys(hookStore.defaultHookSettings) as Category[];
      const preHooks = appDataStore.appData.CONSTANTES.W2P_HOOK_LIST;

      // Si les hooks n'ont jamais été crée les fields ne seront jamais ajouté aux hooks (qui n'existent pas...)
      defaultParametersCategories.forEach(category => {
        preHooks.forEach(preHook => {
          hookStore.getHookFromPreHook(preHook, category); //création éventuelle du hook
        });
      });

      hookStore.updateHookFieldsFromPipedriveFields(allFields);

      return allFields;
    } catch (error) {
      console.log(error);
      addNotification({
        error: true,
        content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
      });
    }
  };

  const setupHooks = () => {
    const categories: Category[] = Object.keys(hookStore.defaultHookSettings) as Category[];
    const preHooks = appDataStore.appData.CONSTANTES.W2P_HOOK_LIST;

    categories.forEach(category => {
      preHooks.forEach(preHook => {
        const hookKey = preHook.key;

        const defaultValues = hookStore.defaultHookSettings[category][hookKey];

        if (defaultValues) {
          const hook = hookStore.getHookFromPreHook(preHook, category);
          hookStore.updateHook(hook.id, { "enabled": true });
          for (const fieldKey in defaultValues) {
            const fieldValue = defaultValues[fieldKey];
            const fields = hookStore.getFields(hook.id)
            fields.forEach((field: HookField) => {
              if (field.pipedrive.key === fieldKey && field.pipedrive.category === category) {
                hookStore.updateHookField(hook, field.id, {
                  value: fieldValue.value,
                  condition: { ...field.condition, ...fieldValue.condition },
                  enabled: true,
                });
              }
            });
          }
        }
      });
    })
  };

  const restoreSettings = () => {
    if (window.confirm(
      translate("Are you sure you want to restore all of your settings")
    )) {
      const newAppDataStore = appDataStore.appData
      newAppDataStore.parameters.w2p = appDataStore.emptyW2Pparameters
      hookStore.updateHookList([])
      appDataStore.setAppData(newAppDataStore)
    }
  }

  const restorePipedriveData = () => {
    if (window.confirm(
      translate("Are you sure you want to delete all of your Pipedrive data")
    )) {
      const newAppData = appDataStore.appData
      newAppData.parameters.pipedrive = appDataStore.emptyPipedriveParameters
      appDataStore.setAppData(newAppData)
      pipedriveFieldsStore.ressetPipedriveFields()
    }
  }

  const handleCompanyDomain = (value: string) => {
    const fomatedValue = value
      .replace(/^https:\/\//, '')
      .replace(/\.pipedrive\.com.*$/, '');
    appDataStore.setPipedriveParameter("company_domain", fomatedValue)
  }

  const syncroniseAll = (retry: boolean) => {
    if (window.confirm("Are you sure you have correctly configured your settings for the 'User Updated' hook and the order states? Please note that you will not be able to cancel the synchronization once it has started")) {

      setTimeout(() => {
        setSyncData(prv => ({
          ...prv, running: true,
        }))
      }, 1000)

      callApi(
        `${appDataStore.appData.w2p_client_rest_url}/start-sync`,
        { method: "GET" },
        null,
        { "re-sync": true, "retry": retry, time: new Date().getTime() }
      )
        .then(async res => {
          addNotification({
            "error": !res?.data?.success,
            "content": res?.data?.message
              ? res.data.message
              : res?.data?.success ? "Synchronization done" : "Error during synchronization"
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

  return (
    <>
      <form onSubmit={e => checkW2pAPI(e)}>
        <h2>W2P connexion</h2>
        <p className='m-b-10'>
          {translate(`To configure your API keys and your domain, 
          connect to your customer area on our site https://w2p.com`)}
        </p>
        <div className='flex w2p-wrap flex-end gap-1'>
          <Input
            className='flex-1 min-w-300'
            label={translate("your site domain")}
            onInput={(value) => appDataStore.setW2pParameter('domain', value)}
            value={appDataStore.appData.parameters.w2p.domain}
            disabled={true}
          />
          <Input
            label={translate("W2P API Key")}
            onInput={(value) => appDataStore.setW2pParameter('api_key', value)}
            value={appDataStore.appData.parameters.w2p.api_key}
            className='flex-1 min-w-300'
          />
          <MainButton
            style={2}>
            {translate("Check connexion")}
          </MainButton>
        </div>
      </form>
      <form className='m-t-100' onSubmit={e => checkPipedriveApi(e)}>
        <h2>Pipedrive</h2>
        <div className='w2p-instructions'>
          <p>{translate(
            `We strongly recommend that you use an API key from a Pipedrive 
            Administrator account so that you can access all the Pipedrive information 
            you need for settings`)}
          </p>
        </div>
        <Tooltip
          mainText={translate("To synchronize your Woocommerce data with Pipedrive, please provide the Pipedrive domain of your organization and an API key")}
          tooltipText={<>{translate("For more information, follow these links")}:
            <li>
              <a target="blank" href='https://pipedrive.readme.io/docs/how-to-find-the-api-token'>https://pipedrive.readme.io/docs/how-to-find-the-api-token</a>
            </li>
            <li>
              <a target="blank" href='https://pipedrive.readme.io/docs/how-to-get-the-company-domain'>https://pipedrive.readme.io/docs/how-to-get-the-company-domain</a>
            </li>
          </>
          }
        />

        <div className='flex w2p-wrap flex-end gap-1'>
          <Input
            className='flex-1 min-w-300'
            label={translate("Company domain")}
            onInput={(value) => handleCompanyDomain(value)}
            value={appDataStore.appData.parameters.pipedrive.company_domain}
          />
          <Input
            label={translate("Pipedrive API Key")}
            onInput={(value) => appDataStore.setPipedriveParameter('api_key', value)}
            value={appDataStore.appData.parameters.pipedrive.api_key}
            className='flex-1 min-w-300'
          />
          <MainButton
            style={2}>
            {translate("Check connexion")}
          </MainButton>
        </div>
      </form >
      <div className='m-t-100'>
        <form onSubmit={e => loadDefaultSettings(e)}>
          <h2>Load default settings</h2>
          <p className='m-b-10'>{translate(`This option allows you to load the plugin's default settings to start with a functional configuration.`)}</p>
          <div className='flex gap-1'>
            <button className='light-button'>
              {translate("Load default settings")}
            </button>
          </div>
        </form>
      </div>
      <div className='m-t-100'>
        <h2>Restore settings</h2>
        <p className='m-b-10'>{translate(`If you experience issues with your settings—particularly if your API key no longer points to the correct company—we recommend resetting your settings.`)}</p>
        <div className='flex gap-1'>
          <button className='light-button' onClick={_ => restoreSettings()}>
            {translate("Restore settings")}
          </button>
          <button className='light-button' onClick={_ => restorePipedriveData()}>
            {translate("Remove and restore all pipedrive data")}
          </button>
        </div>
      </div>
      <div className='m-t-100'>
        <h2>Synchronize all existing data with Pipedrive</h2>
        <p className='m-b-10'>{translate(`This action will synchronize all orders and users from your site with Pipedrive. To prevent system overload, the synchronization process may take several hours depending on the number of items being sent to Pipedrive.`)}</p>
        <p className='m-b-10'>{translate(`Before starting the synchronization, make sure you have properly configured the settings for the order and person hooks.`)}</p>
        <div className='flex gap-1'>
          <button
            className={classNames(
              syncData.running ? "opacity-65 cursor-wait" : "",
              "mt-2"
            )}
            onClick={_ => !syncData.running && syncroniseAll(false)}
            disabled={syncData.running}
          >
            {translate("Synchronize all")}
          </button>
        </div>

        {
          syncData.running || endedNow
            ? <div className='mt-4'>
              <div>
                <div>Users synchronization progress {`${syncData.sync_additional_datas.current_user_index} / ${syncData.sync_additional_datas.total_users}`}</div>
                <ProgressBar completed={parseInt(((syncData.sync_additional_datas.current_user_index / syncData.sync_additional_datas.total_users) * 100).toFixed(0))} />
              </div>
              <div className='mt-2'>
                <div>Orders synchronization progress {`${syncData.sync_additional_datas.current_order_index} / ${syncData.sync_additional_datas.total_orders}`}</div>
                <ProgressBar completed={parseInt(((syncData.sync_additional_datas.current_order_index / syncData.sync_additional_datas.total_orders) * 100).toFixed(0))} />
              </div>

              {syncData.running
                ? <div className='mt-4'>
                  <p>{translate("If the synchronization appears to be stuck for several minutes, you can try restarting it")}</p>
                  <button
                    onClick={_ => syncroniseAll(true)}
                    className='mt-2'
                  >
                    {translate("Restart Synchronization")}
                  </button>
                </div>
                : null
              }
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
        }
      </div>
    </>
  )
}

export default observer(Connexion)