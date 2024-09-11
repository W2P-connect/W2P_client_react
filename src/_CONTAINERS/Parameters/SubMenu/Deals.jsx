import React, { useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import Select from '../../../_COMPONENTS/FORMS/INPUT/select/Select'
import VariableBlock from '../../../_COMPONENTS/LOGICBLOCK/VariableBlock'
import { appDataStore } from '_STORES/AppData'

export default function Deals() {

  const [options, setOptions] = useState(null)

  useEffect(() => {
    setOptions(appDataStore.appData.parameters.w2p.deal)
  }, [])

  useEffect(() => {
    const newAppData = appDataStore.appData
    newAppData.parameters.w2p.deal = options
    appDataStore.setAppData(newAppData)
  }, [options])

  const updateOption = (key, value) => {
    setOptions(prv => ({ ...prv, [key]: value }))
  }

  return (

    <>

      {/* <h2>{translate("General settings")}</h2> */}

      {options
        ? <>
          <h2 className='m-t-50 m-b-10'>{translate("Products settings")}</h2>
          <form>
            <div className='max-w-[450px] min-w-[200px] w-[40%] m-b-25'>
              <Select
                label={"Amounts are"}
                options={[
                  {
                    id: 1,
                    value: 'Tax inclusive',
                    description: translate("Tax is included in product price and in deal value.")
                  },
                  {
                    id: 2,
                    value: 'Tax exclusive',
                    description: translate("Tax isn't included in product price and in deal value. Tax is added to the total amount.")
                  },
                  {
                    id: 3,
                    value: 'No tax',
                    description: translate("Tax isn't included.")
                  },
                ]}
                value={options.amountsAre}
                onSelect={(value) => updateOption('amountsAre', value)}
              />
            </div>
            <div className='m-b-25'>
              <label className='pointer flex align-center m-b-10'>
                <input
                  type="checkbox"
                  className='m-r-10'
                  onChange={(e) => updateOption("createNew", e.target.checked)}
                  checked={options.createNew ?? false}
                />
                <div className='text-red-700'>
                  {translate("If the WooCommerce product does not exist on Pipedrive, create it (recommanded)")}
                </div>
              </label>
              <label className='pointer flex align-center m-b-10'>
                <input
                  type="checkbox"
                  className='m-r-10'
                  onChange={(e) => updateOption("searchBeforeCreate", e.target.checked)}
                  checked={options.searchBeforeCreate ?? false}
                />
                <div className='text-red-700'>
                  {translate("If the WooCommerce product is not yet assigned to a Pipedrive product, avoid product duplicates by searching by name on Pipedrive (recommanded).")}
                </div>
              </label>
            </div>
            <div className='m-b-10'>
              <div className="block text-sm font-medium leading-6 text-gray-900 mb-1">{translate("Pipedrive product name (required)")}</div>
              <VariableBlock
                defautBlock={options.productsName}
                setter={(value) => updateOption("productsName", value)}
              />
            </div>
            <div>
              <div className="block text-sm font-medium leading-6 text-gray-900 mb-1">{translate("Pipedrive product comment")}</div>
              <VariableBlock
                defautBlock={options.productsComment}
                setter={(value) => updateOption("productsComment", value)}
              />
            </div>
          </form>
        </>
        : null
      }

      <h2 className='m-t-50'>{translate("Events settings")}</h2>
      <FieldCategory category={'deal'} />
    </>

  )
}
