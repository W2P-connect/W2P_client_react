import React, { useContext, useState, useEffect } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import { AppDataContext } from '../../../_CONTEXT/appDataContext'
import { observer } from 'mobx-react-lite'
import { appDataStore } from '_STORES/AppData'

const Persons = () => {

    const [options, setOptions] = useState(null)

    useEffect(() => {
        setOptions(appDataStore.appData.parameters.w2p.persons)
    }, [])

    useEffect(() => {
        const newAppData = appDataStore.appData
        newAppData.parameters.w2p.persons = options
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
                        <label className='pointer flex align-center'>
                            <input
                                type="checkbox"
                                className='m-r-10'
                                onChange={(e) => updateOption("linkToOrga", e.target.checked)}
                                checked={options.linkToOrga ?? false}
                            />
                            {translate("Link the user wordpress account to the Pipedrive Organization if it's already defined in Pipedrive (recommanded)")}
                        </label>

                        <label className='pointer flex align-center'>
                            <input
                                type="checkbox"
                                className='m-r-10'
                                onChange={(e) => updateOption("defaultEmailAsName", e.target.checked)}
                                checked={options.defaultEmailAsName ?? false}
                            />
                            {translate("Use user wordpress Email as name if name is not defined during the event (recommanded)")}
                        </label>
                    </form>

                    <h2 className='m-t-50'>{translate("Events settings")}</h2>
                    <FieldCategory category={'person'} />
                </>
                : null
            }
        </>
    )
}

export default observer(Persons)