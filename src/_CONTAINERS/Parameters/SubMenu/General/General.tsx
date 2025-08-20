import { FormEvent, useContext, useEffect, useState } from 'react'
import Input from '../../../../_COMPONENTS/FORMS/INPUT/input/Input';
import { translate } from '../../../../translation';
import { deepCopy, isLocal, useCallApi, useCallPipedriveApi } from '../../../../utils/helpers';
import { appDataStore } from '_STORES/AppData';
import { useAppDataContext, useNotification } from '_CONTEXT/hook/contextHook';
import { observer } from 'mobx-react-lite';
import { hookStore } from '_STORES/Hooks';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.';
import MainButton from '_COMPONENTS/GENERAL/MainButton/MainButton';
import { Category, HookField, PipedriveField } from 'Types';
import Syncronize from './Syncronize';
import { externalLinks } from 'appConstante';
import { PopupContext } from '_CONTEXT/PopupContext';
import { delay } from 'lodash';

const Connexion = () => {

  const { addPopupContent, showPopup } = useContext(PopupContext)

  const callPipedriveApi = useCallPipedriveApi()
  const callApi = useCallApi()

  const [distantDomain, setDistantDomain] = useState<string>("");
  const [distantApiKey, setDistantApiKey] = useState<string>("");


  const { saveParameters } = useAppDataContext()
  const { addNotification } = useNotification()

  const checkPipedriveApi = async (e: FormEvent, notification: boolean = true): Promise<boolean> => {
    e.preventDefault()
    try {
      const response = await callPipedriveApi("dealFields", null, null, null, e)
      if (!response?.status || response?.status !== 200) {
        addNotification({ error: true, content: translate("Connection to Pipedrive failed. Please check the API key or company domain.") })
        return false
      } else {
        if (notification) {
          addNotification({ error: false, content: translate("Connection to Pipedrive successful.") })
          setTimeout(() => startDefaultSettingsAnimation(), 1000)
        }
        await saveParameters(e, false)
        return true
      }
    } catch {
      addNotification({ error: true, content: translate("Connection to Pipedrive failed. Please check the API key or company domain.") })
      return false
    }
  }

  const startDefaultSettingsAnimation = () => {
    if (
      !appDataStore.appData.parameters.w2p.domain ||
      !appDataStore.appData.parameters.w2p.api_key ||
      !appDataStore.appData.parameters.pipedrive.api_key ||
      !appDataStore.appData.parameters.pipedrive.company_domain
    ) {
      return
    }

    addPopupContent(
      <div className='gap-3 grid p-4'>
        <h2 className='p-2'>You’re one click away from syncing WooCommerce with Pipedrive</h2>
        <p className='font-semibold text-lg center'>
          👉 Activate the default settings to start sending your store data to Pipedrive instantly. You can change or disable any of these later.
        </p>

        <div className='flex justify-center items-center gap-4 py-6'>
          <form onSubmit={async e => {
            await loadDefaultSettings(e)
            showPopup(false)
          }}>
            <MainButton type='submit'
              style={1}>
              Load default settings
            </MainButton>
          </form>
          <MainButton onClick={_ => showPopup(false)} style={3}>
            Configure manually
          </MainButton>
        </div>

        <p className='font-medium'>This will configure the following parameters:</p>
        <ul className='pl-4 list-disc'>
          <li>
            <strong>People:</strong> Create or update a Person whenever a WooCommerce user signs up or is updated.
            Sends <em>full name</em>, <em>first/last name</em>, <em>email</em>, and <em>phone</em> when available.
          </li>
          <li>
            <strong>Organizations:</strong> Create or update an Organization from the user’s <em>billing company name</em> on user updates
            (e.g., when billing details are added during checkout).
          </li>
          <li>
            <strong>Deals:</strong> Create and update Deals from WooCommerce orders, attaching line items
            (product name, price, quantity) and the order comment. Deal title, status, and <em>won time</em> are set based on the order status.
          </li>
        </ul>


        <small style={{ color: '#666' }}>
          You can update these defaults anytime in Settings.
        </small>
      </div>
    );
  }

  const checkW2pAPI = async (e: FormEvent, notification: boolean = true): Promise<boolean> => {
    e.preventDefault()
    return callApi(`${appDataStore.appData.w2pcifw_distant_rest_url}/authentification`, { method: 'get' }, null, {
      domain: appDataStore.appData.parameters.w2p.domain,
      api_key: appDataStore.appData.parameters.w2p.api_key,
    }, e, false)
      .then(async res => {
        if (notification) {
          addNotification({ error: false, content: translate(res?.data?.message) })
          setTimeout(() => startDefaultSettingsAnimation(), 1000)
        }
        await saveParameters(e, false)
        return true
      })
      .catch(res => {
        if (res?.response?.request?.status === 500) {
          addNotification({ error: true, content: translate("Our servers are under maintenance, please try again soon") })
        } else {
          addNotification({ error: true, content: translate(res?.response?.data?.message ?? 'An error occured') })
        }
        return false
      }
      )
  }

  const loadDefaultSettings = async (e: FormEvent) => {
    e.preventDefault()
    if (!appDataStore.appData.parameters.pipedrive.api_key || !appDataStore.appData.parameters.pipedrive.company_domain) {
      addNotification({ error: true, content: translate("To load the default settings, you need to provide your Pipedrive API key and your company domain.") })
      return
    }


    const pipeOk = await checkPipedriveApi(e, false)
    if (pipeOk) {
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
      const preHooks = appDataStore.appData.CONSTANTES.W2PCIFW_HOOK_LIST;

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
    const preHooks = appDataStore.appData.CONSTANTES.W2PCIFW_HOOK_LIST;

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
      const domain = appDataStore.appData.parameters.w2p.domain
      const newAppDataStore = appDataStore.appData
      newAppDataStore.parameters.w2p = appDataStore.emptyW2Pparameters
      newAppDataStore.parameters.w2p.domain = domain

      hookStore.updateHookList([])
      appDataStore.setAppData(newAppDataStore)

      callApi(`${appDataStore.appData.w2pcifw_client_rest_url}/restore-parameters`, { method: "put" })
      saveParameters(null, false)
      appDataStore.setAppData(newAppDataStore)

      window.location.reload()

    }
  }

  const restorePipedriveData = async () => {
    if (window.confirm(
      translate("Are you sure you want to delete all of your Pipedrive data")
    )) {
      const newAppData = appDataStore.appData
      newAppData.parameters.pipedrive = appDataStore.emptyPipedriveParameters
      appDataStore.setAppData(newAppData)
      pipedriveFieldsStore.ressetPipedriveFields()
      await callApi(`${appDataStore.appData.w2pcifw_client_rest_url}/restore-pipedrive-parameter`, { method: "put" })
      saveParameters(null, false)

      addNotification({
        content: "Settigns restored !"
      })
    }
  }

  const handleCompanyDomain = (value: string) => {
    const fomatedValue = value
      .replace(/^https:\/\//, '')
      .replace(/\.pipedrive\.com.*$/, '');
    appDataStore.setPipedriveParameter("company_domain", fomatedValue)
  }


  const loadDistantSettings = async (e: FormEvent) => {
    e.preventDefault()
    addNotification({ error: false, content: translate("Loading distant settings...") })
    const query = await callApi(
      `${appDataStore.appData.w2pcifw_client_rest_url}/distant_settings`,
      { method: "get" },
      null,
      { time: new Date().getTime(), distant_rest_url: distantDomain, distant_rest_token: distantApiKey }
    )

    if (query?.status === 200 && query?.data?.success === true && query.data.data) {

      delete query.data?.data?.nonce
      delete query.data?.data?.token
      delete query.data?.data?.w2pcifw_distant_rest_url
      delete query.data?.data?.w2pcifw_client_rest_url
      delete query.data?.data?.parameters.pipedrive.api_key
      delete query.data?.data?.parameters.pipedrive.company_domain
      delete query.data?.data?.parameters.w2p.api_key
      delete query.data?.data?.parameters.pipedrive.domain

      query.data.data.CONSTANTES.W2PCIFW_IS_WOOCOMERCE_ACTIVE = true

      const newAppDataStore = { ...deepCopy(appDataStore.appData), ...deepCopy(query.data.data) }

      appDataStore.setAppData(newAppDataStore)
      hookStore.updateHookList(newAppDataStore.parameters.w2p.hookList);
      pipedriveFieldsStore.setPipedriveFields(newAppDataStore.parameters.pipedrive.fields)

      console.log(newAppDataStore);

      addNotification({ error: false, content: translate("Distant settings loaded") })

    } else {

      addNotification({ error: true, content: translate("Error while loading distant settings") })
    }
  }

  return (
    <>
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url('${appDataStore.appData.build_url}/images/bg-purple.jpg')`
        }}
        className='bg-cover bg-center shadow-md mb-12 p-4 rounded-xl'
      >
        <div className='flex justify-between items-center gap-4'>
          <div>
            <p className='text-base'>👋 Ready to get started? start syncng now by <a target='_blank' rel="noreferrer" className='underline' href={externalLinks.getStarted}>following our setup guide</a>. </p>
          </div>
        </div>
      </div>

      <form onSubmit={e => checkW2pAPI(e)}>

        {
          isLocal()
            ? <div className='mb-12'>
              <h2>Load distant settings</h2>
              <div className='flex flex-end gap-1 w2p-wrap'>
                <Input
                  className='flex-1 min-w-300'
                  label={translate("Distant site domain")}
                  onInput={(value) => setDistantDomain(value)}
                  value={distantDomain}
                />
                <Input
                  className='flex-1 min-w-300'
                  label={translate("Distant site api key")}
                  onInput={(value) => setDistantApiKey(value)}
                  value={distantApiKey}
                />
                <MainButton style={1}
                  type='button'
                  onClick={e => loadDistantSettings(e)}
                >
                  {translate("Load distant settings")}
                </MainButton>
              </div>
            </div>
            : null
        }

        <h2>W2P connexion</h2>
        <p className='m-b-10'>
          {translate(`To configure your API keys and your domain, 
          connect to your customer area`)}{" "}
          <a className='font-semibold underline' href={externalLinks.homePage} rel="noreferrer" target='_blank'>{translate("on our site")}.</a>
        </p>
        <div className='flex flex-end gap-1 w2p-wrap'>
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
            style={1}>
            {translate("Check connexion")}
          </MainButton>
        </div>
      </form>

      <form className='mt-20' onSubmit={e => checkPipedriveApi(e)}>
        <h2>Pipedrive</h2>
        <div className='w2p-instructions'>
          <p>{translate(
            `We strongly recommend using an API key from a 
            Pipedrive Administrator account to ensure 
            access to all the information you need for settings`)}
          </p>
        </div>
        <Tooltip
          mainText={translate("To synchronize your Woocommerce data with Pipedrive, please provide the Pipedrive domain of your organization and an API key")}
          tooltipText={<>{translate("For more information, follow these links")}:
            <li>
              <a rel="noreferrer" target="blank" href='https://pipedrive.readme.io/docs/how-to-find-the-api-token'>https://pipedrive.readme.io/docs/how-to-find-the-api-token</a>
            </li>
            <li>
              <a target="blank" rel="noreferrer" href='https://pipedrive.readme.io/docs/how-to-get-the-company-domain'>https://pipedrive.readme.io/docs/how-to-get-the-company-domain</a>
            </li>
          </>
          }
        />

        <div className='flex flex-end gap-1 w2p-wrap'>
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
            style={1}>
            {translate("Check connexion")}
          </MainButton>
        </div>
      </form >
      <div className='mt-20'>
        <form onSubmit={e => loadDefaultSettings(e)}>
          <h2>Load default settings</h2>
          <p className='m-b-10 font-medium'>{translate(`This option allows you to load the plugin's default settings to start with a functional configuration.`)}</p>
          <ul className='pl-4 list-disc'>
            <li>
              <strong>People:</strong> Create or update a Person whenever a WooCommerce user signs up or is updated.
              Sends <em>full name</em>, <em>first/last name</em>, <em>email</em>, and <em>phone</em> when available.
            </li>
            <li>
              <strong>Organizations:</strong> Create or update an Organization from the user’s <em>billing company name</em> on user updates
              (e.g., when billing details are added during checkout).
            </li>
            <li>
              <strong>Deals:</strong> Create and update Deals from WooCommerce orders, attaching line items
              (product name, price, quantity) and the order comment. Deal title, status, and <em>won time</em> are set based on the order status.
            </li>
          </ul>

          <div className='pt-4'>
            <button className='light-button'>
              {translate("Load default settings")}
            </button>
          </div>



        </form>
      </div>
      <div className='mt-20'>
        <h2>Restore settings</h2>
        <p className='m-b-10'>{translate(`If you experience issues with your settings—particularly if your API key no longer points to the correct company—we recommend restoring your settings.`)}</p>
        <div className='flex gap-1'>
          <button className='light-button' onClick={_ => restoreSettings()}>
            {translate("Restore settings")}
          </button>
          <button className='light-button' onClick={_ => restorePipedriveData()}>
            {translate("Remove all pipedrive data")}
          </button>
        </div>
      </div>
      <div className='mt-20'>
        <Syncronize checkPipedriveApi={checkPipedriveApi} checkW2pAPI={checkW2pAPI} />
      </div>
    </>
  )
}

export default observer(Connexion)