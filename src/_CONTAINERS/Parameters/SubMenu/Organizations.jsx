import React, { useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import { observer } from 'mobx-react-lite'
import { appDataStore } from '_STORES/AppData'
import { deepCopy } from 'helpers'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.'

const Organizations = () => {

  const [options, setOptions] = useState(null)

  useEffect(() => {
    setOptions(appDataStore.appData.parameters.w2p.organization)
  }, [])

  useEffect(() => {
    const newAppData = deepCopy(appDataStore.appData)
    newAppData.parameters.w2p.organization = options
    appDataStore.setAppData(newAppData)
  }, [options])

  const updateOption = (key, value) => {
    setOptions(prv => ({ ...prv, [key]: value }))
  }

  return (
    <>
      {options
        ? <>
          <h2 className='m-t-50 m-b-10'>{translate("General settings")}</h2>
          <form>
            <div className='m-b-25'>
              <div className='w2p-instructions'>
                {translate("The 'billing_company' field is usually provided only when adding billing information when the user places their first order. If you want the organization to be created beforehand, you can use event parameters and other fields like the user's email, which is provided during registration.")}
              </div>
              <label className='pointer flex items-center m-b-10'>
                <input
                  type="checkbox"
                  className='m-r-10'
                  onChange={(e) => updateOption("autoCreate", e.target.checked)}
                  checked={options.autoCreate ?? false}
                />
                <Tooltip
                  mainText={<span>
                    {translate("Automatically create the company on pipedrive when the 'billing_company' field is provided by the user, regardless of the event type, and name it according to the value specified in 'billing_company'.")}
                  </span>}
                  tooltipText={
                    <>
                      {translate("Before creating the organization, we will search by its name on Pipedrive to avoid duplicates.")}
                    </>
                  }
                />
                <div className='text-red-700'>
                </div>
              </label>
              {/* <label className='pointer flex items-center m-b-10'>
                <input
                  type="checkbox"
                  className='m-r-10'
                  onChange={(e) => updateOption("searchBeforeCreate", e.target.checked)}
                  checked={options.searchBeforeCreate ?? false}
                />
                <div className='text-red-700'>
                  (en vrai je me demande si on le met pas quoi qu'il arrive, personne dira non)
                  {translate("Before creating the organization, search by its name on Pipedrive to avoid duplicates. (recommanded).")}
                </div>
              </label> */}
            </div>
          </form>
        </>
        : null
      }

      <h2 className='m-t-50'>{translate("Events settings")}</h2>
      <FieldCategory category={'organization'} />
    </>
  )
}

export default observer(Organizations)