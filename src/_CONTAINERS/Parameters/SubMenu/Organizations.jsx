import React, { useEffect, useState } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import { observer } from 'mobx-react-lite'
import { appDataStore } from '_STORES/AppData'
import { deepCopy } from 'utils/helpers'
import { externalLinks } from 'appConstante'
import NeedHelpSection from '_COMPONENTS/GENERAL/Parameters/NeedHelpSection'

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

      <NeedHelpSection />

      <h2 className='m-t-50'>{translate("Events settings")}</h2>
      <FieldCategory category={'organization'} />
    </>
  )
}

export default observer(Organizations)