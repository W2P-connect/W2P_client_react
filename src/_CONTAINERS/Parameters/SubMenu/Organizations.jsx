import React, { useContext, useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { AppDataContext } from '../../../_CONTEXT/appDataContext'
import { translate } from '../../../translation'

export default function Organizations() {

  const { appData, updateAppDataKey } = useContext(AppDataContext)

  const [options, setOptions] = useState(null)

  useEffect(() => {
    setOptions(appData.parameters.w2p.organizations)
  }, [])

  useEffect(() => {
    updateAppDataKey("parameters.w2p.organizations", options)
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
                  checked={options.createNew ?? false}
                />
                <div>
                  {translate("Automatically create the company when the 'billing_company' field is provided by the user, regardless of the event type, and name it according to the value specified in 'billing_company'.")}
                </div>
              </label>
              <label className='pointer flex items-center m-b-10'>
                <input
                  type="checkbox"
                  className='m-r-10'
                  onChange={(e) => updateOption("searchBeforeCreate", e.target.checked)}
                  checked={options.searchBeforeCreate ?? false}
                />
                {translate("Before creating the organization, search by its name on Pipedrive to avoid duplicates. (recommanded).")}
              </label>
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
