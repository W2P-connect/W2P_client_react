import React, { useState, useEffect } from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'
import { observer } from 'mobx-react-lite'
import { appDataStore } from '_STORES/AppData'
import { deepCopy } from 'utils/helpers'
import Tooltip from '_COMPONENTS/GENERAL/ToolType/ToolType.'
import { externalLinks } from 'appConstante'

const Persons = () => {

    const [options, setOptions] = useState(null)

    useEffect(() => {
        setOptions(appDataStore.appData.parameters.w2p.person)
    }, [])

    useEffect(() => {
        const newAppData = deepCopy(appDataStore.appData)
        newAppData.parameters.w2p.person = options
        appDataStore.setAppData(newAppData)
    }, [options])

    const updateOption = (key, value) => {
        setOptions(prv => ({ ...prv, [key]: value }))
    }

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

            {options
                ? <>
                    <h2>{translate("General settings")}</h2>

                    <form>
                        <label className='flex items-center mb-1 cursor-pointer align-center'>
                            <input
                                type="checkbox"
                                className='m-r-10'
                                onChange={(e) => updateOption("linkToOrga", e.target.checked)}
                                checked={options.linkToOrga ?? false}
                            />
                            <div>
                                {translate("Link the WordPress user account to the Pipedrive organization if the Pipedrive person is already associated with one (recommended)")}
                            </div>
                        </label>

                        <label className='flex items-center cursor-pointer align-center'>
                            <input
                                type="checkbox"
                                className='m-r-10'
                                onChange={(e) => updateOption("defaultEmailAsName", e.target.checked)}
                                checked={options.defaultEmailAsName ?? false}
                            />
                            <Tooltip
                                mainText={<span>{translate("Use the user's WordPress email as the name if no name is defined during the event (recommended).")}</span>}
                                tooltipText={translate("The email will only be applied if necessary when creating a person in Pipedrive. If needed, it will also be used to search for an existing person in Pipedrive associated with this email.")}
                            />

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