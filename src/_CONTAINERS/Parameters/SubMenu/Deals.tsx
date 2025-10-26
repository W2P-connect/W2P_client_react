import React, { useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import Select from '../../../_COMPONENTS/FORMS/INPUT/select/Select'
import VariableBlock, { getBlockExemple } from '../../../_COMPONENTS/LOGICBLOCK/VariableBlock'
import { appDataStore } from '_STORES/AppData'
import { classNames, deepCopy } from 'utils/helpers'
import NeedHelpSection from '_COMPONENTS/GENERAL/Parameters/NeedHelpSection'
import RenderIf from '_COMPONENTS/GENERAL/RenderIf'
import { DealsConfig } from 'Types'
import { hookStore } from '_STORES/Hooks'
import HookFieldList from '_COMPONENTS/HOOK/HookField/HookFieldList'
import { observer } from 'mobx-react-lite'

const Deals = observer(() => {

  const [options, setOptions] = useState<DealsConfig | null>(null)
  const [guestOrderTab, setGuestOrderTab] = useState<'person' | 'organization'>('person')
  const gestPersonOrderHook = hookStore.getHook(hookStore.defaultGuestOrderHook.id) || hookStore.defaultGuestOrderHook
  const gestOrganizationOrderHook = hookStore.getHook(hookStore.defaultGuestOrganizationOrderHook.id) || hookStore.defaultGuestOrganizationOrderHook

  useEffect(() => {
    setOptions(appDataStore.appData.parameters.w2p.deal)
  }, [])

  useEffect(() => {
    const newAppData = deepCopy(appDataStore.appData)
    newAppData.parameters.w2p.deal = options
    appDataStore.setAppData(newAppData)
  }, [options])

  const updateOption = (key: keyof DealsConfig, value: any) => {
    setOptions(prev => {
      if (!prev) return prev // ou return null
      return { ...prev, [key]: value }
    })
  }


  return (
    <>
      <NeedHelpSection />

      {options
        ? <>
          <h2>{translate("General settings")}</h2>

          <div className="mb-1 font-medium text-gray-900 text-sm leading-6">
            {translate("Default deal name (if not defined in the event) : ")}
            <span className='mb-1 text-gray-700 text-xs italic'>
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
            source={"order"}
            className='!border-none'
          />

          <RenderIf condition={appDataStore.appData.CONSTANTES.W2PCIFW_GUEST_CHECKOUT_ENABLED}>
            <div>
              <h3 className='mt-8 mb-4 font-medium text-gray-900'>{translate("Guest orders sync")}</h3>
              
              {/* Navigation tabs */}
              <div className=' mb-4 border-b-2 border-gray-200 relative'>
              <div className='relative flex gap-0 bottom-[-1px]'>
              <div
                onClick={() => setGuestOrderTab('person')}
                className={classNames(
                  'px-4 py-2 font-medium transition-colors border-b-2 cursor-pointer',
                  guestOrderTab === 'person'
                    ? 'border-b border-b-gray-900 font-semibold text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {translate("Persons")}
              </div>
              <div
                onClick={() => setGuestOrderTab('organization')}
                className={classNames(
                  'px-4 py-2 font-medium transition-colors border-b-2 cursor-pointer',
                  guestOrderTab === 'organization'
                    ? 'border-b border-b-gray-900 font-semibold text-gray-900'
                    : 'border-b-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {translate("Organizations")}
              </div>
              </div>
            </div>

            {/* Person tab content */}
            <RenderIf condition={guestOrderTab === 'person'}>
              <div>
                <div className='flex items-center mb-4'>
                  <label className='flex items-center gap-1 cursor-pointer'>
                    <input
                      type="checkbox"
                      onChange={(e) => updateOption("syncPersonsForGuestOrders", e.target.checked)}
                      checked={options.syncPersonsForGuestOrders ?? false}
                    />
                    {translate("Enable guest order sync for Pipedrive persons")}
                  </label>
                </div>

                <RenderIf condition={options.syncPersonsForGuestOrders}>
                  <div className='p-4 border rounded-xl max-h-[600px] overflow-y-auto'>
                    <HookFieldList
                      hook={gestPersonOrderHook}
                      showHookParameters={false}
                      search={true} />
                  </div>
                </RenderIf>
              </div>
            </RenderIf>

            {/* Organization tab content */}
            <RenderIf condition={guestOrderTab === 'organization'}>
              <div>
                <div className='flex items-center mb-4'>
                  <label className='flex items-center gap-1 cursor-pointer'>
                    <input
                      type="checkbox"
                      onChange={(e) => updateOption("syncOrganizationsForGuestOrders", e.target.checked)}
                      checked={options.syncOrganizationsForGuestOrders ?? false}
                    />
                    {translate("Enable guest order sync for Pipedrive organizations")}
                  </label>
                </div>

                <RenderIf condition={options.syncOrganizationsForGuestOrders}>
                  <div className='p-4 border rounded-xl max-h-[600px] overflow-y-auto'>
                    <HookFieldList
                      hook={gestOrganizationOrderHook}
                      showHookParameters={false}
                      search={true} />
                  </div>
                </RenderIf>
              </div>
            </RenderIf>
            </div>
          </RenderIf>

          <h2 className='m-b-10 m-t-50'>{translate("Products settings")}</h2>
          <form>
            <div className='pt-2'>
              <label className='flex items-center gap-1 mb-2 cursor-pointer'>
                <input
                  type="checkbox"
                  onChange={(e) => updateOption("sendProducts", e.target.checked)}
                  checked={options.sendProducts ?? false}
                />
                <div>
                  {translate("Send WooCommerce order products to the Pipedrive Deal when an event is triggered.")}
                </div>
              </label>
            </div>

            <div className={classNames(
              options.sendProducts ? '' : 'opacity-65 pointer-events-none'
            )}>
              <div className='m-b-25 w-[40%] min-w-[200px] max-w-[450px]'>
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
                <div className="block mb-1 font-medium text-gray-900 text-sm leading-6">{translate("Pipedrive product name (required)")}</div>
                {/* <div className='mb-2'>
                  <label className='flex items-center gap-1 cursor-pointer'>
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
                  source={"product"}
                />
              </div>
              <div>
                <div className="block mb-1 font-medium text-gray-900 text-sm leading-6">{translate("Pipedrive product comment")}</div>
                <VariableBlock
                  defautBlock={options.productsComment}
                  setter={(value) => updateOption("productsComment", value)}
                  source={"product"}
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
})

export default Deals
