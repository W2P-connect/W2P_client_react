import React from 'react'
import FieldCategory from './FieldCategory'
import { translate } from '../../../translation'

export default function Persons() {
    return (
        <>
            <h2>{translate("General settings")}</h2>

            <form>
                <label className='pointer flex align-center'>
                    <input type="checkbox" className='m-r-10' />
                    Link the user wordpress account to the Pipedrive Organization if it's already defined in Pipedrive (recommanded)
                </label>

                <label className='pointer flex align-center'>
                    <input type="checkbox" className='m-r-10' />
                    Use user wordpress Email as name if name is not defined during the event (recommanded)
                </label>
                
                <label className='pointer flex align-center'>
                    <input type="checkbox" className='m-r-10' />
                    Use user wordpress Email as name if name is not defined during the event (recommanded)
                </label>
            </form>

            <h2 className='m-t-50'>{translate("Events settings")}</h2>
            <FieldCategory category={'person'} />

        </>
    )
}
