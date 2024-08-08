import React, { useContext } from 'react'
import Input from '../../../_COMPONENTS/FORMS/INPUT/input/Input';
import { translate } from '../../../translation';
import { AppDataContext, emptyLocalizer } from '../../../_CONTEXT/appDataContext';
import { useCallApi, useCallPipedriveApi } from '../../../helpers';
import { NotificationContext } from '../../../_CONTEXT/NotificationContext';

export default function Connexion() {

  const callPipedriveApi = useCallPipedriveApi()
  const callApi = useCallApi()

  const { appData, updateAppDataKey, saveParameters, setAppData } = useContext(AppDataContext)
  const { addNotification } = useContext(NotificationContext)

  const checkPipedriveApi = (e) => {
    e.preventDefault()
    callPipedriveApi("dealFields", null, null, null, e)
      .then(async _ => {
        addNotification({ error: false, content: translate("Connection to Pipedrive successful.") })
        await saveParameters()
      })
      .catch(_ => addNotification({ error: true, content: translate("Connection failed. Please check the API key or company domain.") }))
  }

  const checkW2pAPI = (e) => {
    e.preventDefault()
    callApi(`${appData.w2p_distant_rest_url}/authentification`, null, null, {
      domain: appData.parameters.w2p.domain,
      api_key: appData.parameters.w2p.api_key,
    }, e)
      .then(async res => {
        addNotification({ error: false, content: translate(res.data?.message) })
        await saveParameters()
      })
      .catch(res => {
        console.log(res);
        if (res?.response?.request?.status === 500) {
          addNotification({ error: true, content: translate("Our servers are under maintenance, please try again soon") })
        } else {
          addNotification({ error: true, content: translate(res?.response?.data?.message) })
        }
      }
      )
  }

  const restoreSettings = (e) => {
    setAppData(prv => {
      prv = { ...prv, parameters: emptyLocalizer.parameters }
      saveParameters(e, prv.parameters)
      return prv
    })
  }

  const restorePipedriveData = (e) => {
    if (window.confirm(
      translate("Are you sure you want to delete all of your Pipedrive data")
    )) {
      setAppData(prv => {
        const parameters = prv.parameters
        parameters.pipedrive = emptyLocalizer.parameters.pipedrive
        return { ...prv, parameters: parameters }
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
            onInput={(value) => updateAppDataKey('parameters.w2p.domain', value)}
            value={appData.parameters.w2p.domain}
            disabled={true}
          />
          <Input
            label={translate("W2P API Key")}
            onInput={(value) => updateAppDataKey('parameters.w2p.api_key', value)}
            value={appData.parameters.w2p.api_key}
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
            onInput={updateAppDataKey}
            customParameters={['parameters.pipedrive.company_domain']}
            value={appData.parameters.pipedrive.company_domain}
          />
          <Input
            label={translate("Pipedrive API Key")}
            onInput={updateAppDataKey}
            customParameters={['parameters.pipedrive.api_key']}
            value={appData.parameters.pipedrive.api_key}
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
          <button className='light-button' onClick={e => restoreSettings(e)}>
            {translate("Restore settings")}
          </button>
          <button className='light-button' onClick={e => restorePipedriveData(e)}>
            {translate("Remove all pipedrive data")}
          </button>
        </div>
      </div>
    </>
  )
}
