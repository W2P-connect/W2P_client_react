import React, { FormEvent } from 'react'
import Input from '../../../_COMPONENTS/FORMS/INPUT/input/Input';
import { translate } from '../../../translation';
import { useCallApi, useCallPipedriveApi } from '../../../helpers';
import { appDataStore } from '_STORES/AppData';
import { useAppDataContext, useNotification } from '_CONTEXT/hook/contextHook';
import { observer } from 'mobx-react-lite';
import { runInAction, toJS } from 'mobx';
import { hookStore } from '_STORES/Hooks';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';

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
          <button
            className='strong-button'>
            {translate("Check connexion")}
          </button>
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
        <p>{translate("To synchronize your Woocommerce data with Pipedrive, please provide the Pipedrive domain of your organization and an API key. For more information, follow this link : ")}
          <a href='https://developers.pipedrive.com/docs/api/v1'>https://developers.pipedrive.com/docs/api/v1</a>
        </p>
        <div className='flex w2p-wrap flex-end gap-1'>
          <Input
            className='flex-1 min-w-300'
            label={translate("Company domain")}
            onInput={(value) => appDataStore.setPipedriveParameter("company_domain", value)}
            value={appDataStore.appData.parameters.pipedrive.company_domain}
          />
          <Input
            label={translate("Pipedrive API Key")}
            onInput={(value) => appDataStore.setPipedriveParameter('api_key', value)}
            value={appDataStore.appData.parameters.pipedrive.api_key}
            className='flex-1 min-w-300'
          />
          <button
            className='strong-button'>
            {translate("Check connexion")}
          </button>
        </div>
      </form >
      <div className='m-t-100'>
        <h2>Settings</h2>
        <p className='m-b-10'>{translate(`If you encounter problems with your settings 
        - especially if your API key no longer targets the same company 
        - we recommend that you reset your settings`)}</p>
        <div className='flex gap-1'>
          <button className='light-button' onClick={_ => restoreSettings()}>
            {translate("Restore settings")}
          </button>
          <button className='light-button' onClick={_ => restorePipedriveData()}>
            {translate("Remove all pipedrive data")}
          </button>
        </div>
      </div>
    </>
  )
}

export default observer(Connexion)