import React, { FormEvent } from 'react'
import Input from '../../../_COMPONENTS/FORMS/INPUT/input/Input';
import { translate } from '../../../translation';
import { deepMerge, useCallApi, useCallPipedriveApi } from '../../../helpers';
import { appDataStore } from '_STORES/AppData';
import { useAppDataContext, useNotification } from '_CONTEXT/hook/contextHook';
import { observer } from 'mobx-react-lite';
import { runInAction, toJS } from 'mobx';
import { hookStore } from '_STORES/Hooks';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.';
import MainButton from '_COMPONENTS/GENERAL/MainButton/MainButton';
import { Category, HookField, PipedriveField } from 'Types';

const Connexion = () => {

  const callPipedriveApi = useCallPipedriveApi()
  const callApi = useCallApi()

  console.log('appDataStore.appData', toJS(appDataStore.appData));

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
              console.log("field.pipedrive.category", field.pipedrive.category);
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
    </>
  )
}

export default observer(Connexion)