import { hookStore } from '_STORES/Hooks';
import { updateNestedObject } from 'helpers';
import React, { useState } from 'react'
import { translate } from 'translation'
import { Hook, HookField as HookFieldType } from 'Types';
import HookField from './HookField';
import { hookFieldStore } from '_STORES/HookField';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';
import Datalist from '_COMPONENTS/FORMS/INPUT/datalist/Datalist';

export default function HookFieldList({ hook }: { hook: Hook }) {

    const categoryFields = pipedriveFieldsStore.getCategoryFields(hook.category);

    const [searchField, setSearchField] = useState<string>("")

    const updateHook = (hookId: string, path: string, value: any) => {
        const hook = hookStore.getHook(hookId);
        if (hook) {
            const updatedHook = updateNestedObject(hook, path, value);
            hookStore.updateHook(hookId, updatedHook);
        }
    };

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
                    <h5 className='m-b-25'>{translate(`Parameter of the event : ${hook.label}`)}</h5>

                    {/* C'est clairement la V2/ */}
                    {/* <label className='pointer flex items-center m-b-10'>
                        <input
                            type='checkbox'
                            className='m-r-10'
                            onChange={e => hook && updateHook(hook.id, 'option.createActivity', e.target.checked)}
                            checked={hook.option.createActivity ?? false}
                        />
                        <div>
                            {translate('Add an activity when this event is triggered.')}
                            <div className='subtext'>
                                {translate(
                                    `An activity specifying the updated fields and the triggered event will be automatically added to the ${hook.category} on Pipedrive.`
                                )}
                            </div>
                        </div>
                    </label> */}

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
                            {filteredHookFieldsList
                                .filter(hookfield => hookFieldStore.isImportant(hookfield))
                                .map(hookfield => <HookField key={hookfield?.id} hookField={hookfield} />)}
                            {/* other fields */}
                            {filteredHookFieldsList
                                .filter(hookfield => !hookFieldStore.isImportant(hookfield))
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
