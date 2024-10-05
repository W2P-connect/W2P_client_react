import { hookStore } from '_STORES/Hooks';
import { updateNestedObject } from 'helpers';
import React, { useState } from 'react'
import { translate } from 'translation'
import { Hook, HookField as HookFieldType } from 'Types';
import HookField from './HookField';
import { hookFieldStore } from '_STORES/HookField';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';
import Datalist from '_COMPONENTS/FORMS/INPUT/datalist/Datalist';
import HookParameters from '../HooksParameters/HookParameters';

export default function HookFieldList({ hook }: { hook: Hook }) {

    const categoryFields = pipedriveFieldsStore.getCategoryFields(hook.category);

    const [searchField, setSearchField] = useState<string>("")

    const filteredHookFieldsList: HookFieldType[] = hook
        ? categoryFields
            .filter(field => searchField
                ? field.name.includes(searchField)
                : true)
            .map(field => hookStore.getHookFieldFromPipedrive(hook.id, field.id))
            .filter((hookfield): hookfield is HookFieldType => hookfield !== null)
        : []

    return (
        <div key={hook.id}>
            {filteredHookFieldsList
                ? <div>

                    <HookParameters hook={hook} />

                    <div className='m-b-25'>
                        <Datalist
                            label={translate('Search a field')}
                            placeholder={translate('Name, owner, email,...')}
                            items={categoryFields.map(field => ({ value: field.name, id: field.id }))}
                            value={searchField}
                            onInput={setSearchField}
                        />
                    </div>

                    {filteredHookFieldsList.length ?
                        <div className='flex column m-t-25 gap-1'>
                            {/* Priority fields */}
                            {/* TODO  ici ce serait plus pertinent de filtrer au chargement des fields et de les triers dans le bon ordre ! */}
                            {filteredHookFieldsList
                                .filter(hookfield => hookFieldStore.isImportant(hookfield) || hookfield.enabled)
                                .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                            {/* other fields */}
                            {filteredHookFieldsList
                                .filter(hookfield => !hookFieldStore.isImportant(hookfield) && !hookfield.enabled)
                                .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                        </div>
                        : <p>
                            {searchField
                                ? translate('There is no field to show.')
                                : translate("You haven't loaded custom fields yet.")}
                        </p>
                    }
                </div>
                : null
            }
        </div>)
}
