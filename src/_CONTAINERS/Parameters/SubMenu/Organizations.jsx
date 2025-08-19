import React, { useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import { observer } from 'mobx-react-lite'
import { appDataStore } from '_STORES/AppData'
import { deepCopy } from 'utils/helpers'
import { externalLinks } from 'appConstante'

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
            <p className='text-base'>👋 Need help? Follow our guide <a target='_blank' rel="noreferrer" className='underline' href={externalLinks.setupGuide}>here</a>. </p>
          </div>
        </div>
      </div>

      <h2 className='m-t-50'>{translate("Events settings")}</h2>
      <FieldCategory category={'organization'} />
    </>
  )
}

export default observer(Organizations)