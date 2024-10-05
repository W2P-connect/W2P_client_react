import React, { useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import Select from '../../../_COMPONENTS/FORMS/INPUT/select/Select'
import VariableBlock, { getBlockExemple } from '../../../_COMPONENTS/LOGICBLOCK/VariableBlock'
import { appDataStore } from '_STORES/AppData'
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.'
import { classNames } from 'helpers'

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
      {options
        ? <>

          <h2>{translate("General settings")}</h2>

          <form>
            <div className="text-sm font-medium leading-6 text-gray-900 mb-1 ">
              {translate("Default deal name (if not defined in the event) : ")}
              <span className='italic text-xs text-gray-700 mb-1'>
                {options.defaultOrderName
                  ? getBlockExemple(options.defaultOrderName)
                  : null
                }
              </span>
            </div>
            <VariableBlock
              defautBlock={options.defaultOrderName}
              setter={(value) => updateOption("defaultOrderName", value)}
              showExemple={false}
            />
          </form>

          <h2 className='m-t-50 m-b-10'>{translate("Products settings")}</h2>
          <form>
            <div className='pt-2'>
              <label className='cursor-pointer gap-1 flex items-center mb-2'>
                <input
                  type="checkbox"
                  onChange={(e) => updateOption("sendProducts", e.target.checked)}
                  checked={options.sendProducts ?? false}
                />
                <div>
                  {translate("Send WooCommerce order products to the Pipedrive Deal.")}
                </div>
              </label>
            </div>

            <div className={classNames(
              options.sendProducts ? '' : 'opacity-65 pointer-events-none'
            )}>
              <div className='max-w-[450px] min-w-[200px] w-[40%] m-b-25'>
                <Select
                  label={"Amounts are"}
                  options={[
                    {
                      id: 1,
                      value: 'inclusive',
                      label: 'Tax inclusive',
                      description: translate("Tax is included in product price and in deal value.")
                    },
                    {
                      id: 2,
                      value: 'exclusive',
                      label: 'Tax exclusive',
                      description: translate("Tax isn't included in product price and in deal value. Tax is added to the total amount.")
                    },
                    {
                      id: 3,
                      value: 'none',
                      label: 'No tax',
                      description: translate("Tax isn't included.")
                    },
                  ]}
                  value={options.amountsAre}
                  onSelect={(value) => updateOption('amountsAre', value)}
                />
              </div>
              <div className='mb-2'>
                <div className="block text-sm font-medium leading-6 text-gray-900 mb-1">{translate("Pipedrive product name (required)")}</div>
                {/* <div className='mb-2'>
                  <label className='cursor-pointer gap-1 flex items-center'>
                    <input
                      type="checkbox"
                      onChange={(e) => updateOption("searchBeforeCreate", e.target.checked)}
                      checked={options.searchBeforeCreate ?? false}
                    />
                    <div className='text-red-700'>
                      {translate("If the WooCommerce product is not yet assigned to a Pipedrive product, avoid product duplicates by searching by name on Pipedrive (recommanded).")}
                    </div>
                  </label>
                </div> */}
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
            </div>
          </form>
        </>
        : null
      }

      <h2 className='mt-12'>{translate("Events settings")}</h2>
      <FieldCategory category={'deal'} />
    </>

  )
}
