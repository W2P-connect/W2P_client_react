import { hookStore } from '_STORES/Hooks';
import React, { useMemo, useState } from 'react'
import { translate } from 'translation'
import { Hook, HookField as HookFieldType } from 'Types';
import HookField from './HookField';
import { hookFieldStore } from '_STORES/HookField';
import { pipedriveFieldsStore } from '_STORES/PipedriveFields';
import Datalist from '_COMPONENTS/FORMS/INPUT/datalist/Datalist';
import HookParameters from '../HooksParameters/HookParameters';
import RenderIf from '_COMPONENTS/GENERAL/RenderIf';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

type Props = {
    hook: Hook;
    search?: boolean;
    showHookParameters?: boolean;
}

const HookFieldList = ({ hook, search = true, showHookParameters = true }: Props) => {

    const categoryFields = pipedriveFieldsStore.getCategoryFields(hook.category);


    const [searchField, setSearchField] = useState<string>("")

    const filteredHookFieldsList: HookFieldType[] = useMemo(() =>
        hook
            ? categoryFields
                .filter(field => searchField
                    ? field.name.includes(searchField)
                    : true)
                .map(field => hookStore.getHookFieldFromPipedrive(hook.id, field.id))
                .filter((hookfield): hookfield is HookFieldType => hookfield !== null)
            : []
        , [hook.id, categoryFields, searchField])

    console.log(filteredHookFieldsList);

    return (
        <div key={hook.id}>
            {filteredHookFieldsList
                ? <div>

                    <RenderIf condition={showHookParameters}>
                        <HookParameters hook={hook} />
                    </RenderIf>

                    <RenderIf condition={search}>
                        <div className='m-b-25'>
                            <Datalist
                                label={translate('Search a Pipedrive field')}
                                placeholder={translate('Name, owner, email,...')}
                                items={categoryFields.map(field => ({ value: field.name, id: field.id }))}
                                value={searchField}
                                onInput={setSearchField}
                            />
                        </div>
                    </RenderIf>

                    {filteredHookFieldsList.length ?
                        <div className='flex gap-1 m-t-25 column'>
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
        </div>
    )
}

export default observer(HookFieldList)