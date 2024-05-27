import React, { useContext, useState, useEffect } from 'react'
import { translate } from '../../../translation'
import { useCallPipedriveApi } from '../../../helpers'
import { AppDataContext } from '../../../_CONTEXT/appDataContext'
import PipepdriveField from '../../../_COMPONENTS/PIPEDRIVE/PipedriveField/PipepdriveField'
import { NotificationContext } from '../../../_CONTEXT/NotificationContext'
import { usePipedriveFields } from '../parametersHelpers'
import Datalist from '../../../_COMPONENTS/FORMS/INPUT/datalist/Datalist'
import HookSelector from '../../../_COMPONENTS/HookSelector/HookSelector'

export default function FieldCategory({ category }) {

  const callPipedriveApi = useCallPipedriveApi()

  const { formatPipedriveFields } = usePipedriveFields()

  const { appData, saveParameters, setAppData } = useContext(AppDataContext)
  const { addNotification } = useContext(NotificationContext)

  const [searchField, setSearchField] = useState("")
  const [filedsList, setFieldsList] = useState(null)
  const [hookToShow, setHookToShow] = useState(null)

  const getCategoryFields = (e) => {
    callPipedriveApi(`${category}Fields`, null, null, null, e)
      .then(res => {
        setAppData(prvAppData => {
          prvAppData.parameters.pipedrive[`${category}Fields`] = formatPipedriveFields(res.data.data)
          return { ...prvAppData }
        })
      }
      )
      .catch(error => {
        addNotification({
          error: true,
          content: translate("Pipedrive has encountered an error, make sure you have configured it correctly")
        })
      })
  }

  useEffect(() => {
    setFieldsList(appData.parameters.pipedrive[`${category}Fields`])
  }, [appData.parameters.pipedrive[`${category}Fields`]])


  useEffect(() => {
    if (searchField) {
      setFieldsList(_ => appData.parameters.pipedrive[`${category}Fields`].filter(field => field.name.includes(searchField)))
    } else {
      setFieldsList(appData.parameters.pipedrive[`${category}Fields`])
    }
  }, [searchField])

  const selectHookToSetUp = (hook) => {
    console.log(hook);
    setHookToShow(_ => hook)
  }

  return (
    <div key={category}>
      <form onSubmit={e => saveParameters(e)}>
        <div className='w2p-instructions'>
          <p>{translate(`Select the different events that will sync Woocommerce and wordpress informations to Pipedrive.`)}</p>
        </div>
        <div className='flex gap-1 w2p-wrap m-b-25 m-t-25'>
          {appData.CONSTANTES.W2P_HOOK_LIST
            .filter(hook => !hook?.disabledFor?.includes(category))
            .map(hook => {
              return <HookSelector key={hook.key} parentHook={hook} selector={selectHookToSetUp} category={category} active={hookToShow?.key === hook.key} />
            }
            )}
        </div>

        {hookToShow && hookToShow.enabled
          ? <div key={hookToShow.key}>
            <div className='w2p-instructions'>
              <p>{translate(
                `Here you can load genseral and custom fields from Pipedrive ${category}s\
           to populate them with data from either Woocommerce.`)}
                <br />
                {translate("Set the value to assign to the fields during various user events.")}
              </p>
            </div>
            {filedsList
              ? <div key={category}>
                <h5>{translate(`Parameter of the event : ${hookToShow.label}`)}</h5>
                <div className='m-b-25'>
                  <Datalist
                    label={translate("Search a field")}
                    placehoder={translate("Name, owner, email,...")}
                    items={appData.parameters.pipedrive[`${category}Fields`].map(field => ({ value: field.name, id: field.id }))}
                    value={searchField}
                    onInput={setSearchField}
                  />
                </div>
                {filedsList.length
                  ? <div className='flex column m-t-25 gap-1'>
                    {filedsList
                      .filter(field => !field.enabled)
                      .map((field, index) =>
                        <PipepdriveField pipedriveField={field} key={field.id} relatedHook={hookToShow} />
                      )}
                  </div>
                  : <p>{searchField
                    ? translate("There is not field to show.")
                    : translate("You haven't loaded custom fields yet.")
                  }
                  </p>}
              </div>
              : null
            }
            <button
              type='button'
              onClick={e => getCategoryFields(e)}
              className='light-button m-t-25'
            >
              {translate("Load custom fields")}
            </button>
          </div>
          : <h3 className='center m-t-25'>{translate("Select an event to configure it")}</h3>}
      </form>
    </div>
  )
}
