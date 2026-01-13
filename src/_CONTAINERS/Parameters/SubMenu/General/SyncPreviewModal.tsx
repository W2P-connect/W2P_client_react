import React from 'react'
import { translate } from 'translation'
import { Hook, HookField, Block } from 'Types'
import { mayJsonParse } from 'utils/helpers'
import { getBlockExemple } from '_COMPONENTS/LOGICBLOCK/VariableBlock'
import MainButton from '_COMPONENTS/GENERAL/MainButton/MainButton'

interface SyncInfo {
    personHook?: { hook: Hook; fields: HookField[] }
    organizationHook?: { hook: Hook; fields: HookField[] }
    dealHooks: { hook: Hook; fields: HookField[] }[]
}

interface Props {
    syncInfo: SyncInfo
    onCancel: () => void
    onStart: () => void
}

// Field badge component
const FieldBadge = ({ field }: { field: HookField }) => {
    // Get example value from field
    const getExampleValue = (): string => {
        const value = field.value

        // Handle array of blocks (LogicBlocks)
        if (Array.isArray(value) && value.length && typeof value[0] !== "number") {
            return getBlockExemple(value[0] as Block)
        }

        // Handle array of numbers/strings
        if (Array.isArray(value) && value.length) {
            return value.map(v => mayJsonParse(`${v}`, v)).join(', ')
        }

        // Handle boolean values
        if (typeof value === "boolean") {
            return value ? translate("Yes") : translate("No")
        }

        // Handle other values (string, number, etc.)
        return mayJsonParse(`${value}`, value)
    }

    const exampleValue = getExampleValue()

    return (
        <div className="flex items-center gap-0.5 bg-gray-100 shadow-sm px-2 py-[2px] border rounded-xl">
            <span>{field.pipedrive.field_name}</span>
            {exampleValue && (
                <span className="text-gray-600 text-xs italic">: {exampleValue}</span>
            )}
        </div>
    )
}

export default function SyncPreviewModal({ syncInfo, onCancel, onStart }: Props) {
    return (
        <div className="p-6">
            <h2 className="mb-4 font-bold text-2xl">{translate("Synchronization Preview")}</h2>
            <p className="mb-2">{translate("The following data will be synchronized")}</p>
            <p className="mb-6">
                {translate("If you want to change the data being synchronized, go to each category’s settings to configure your hooks and fields.")}
            </p>

            <div className='flex flex-wrap gap-4 mb-6 w-full'>
                {/* Persons Category */}
                <div className="width-1/2">
                    <h3 className="mb-2 font-semibold text-lg">{translate("Persons")}</h3>
                    <div className="flex flex-wrap gap-2">
                        {syncInfo.personHook ? (
                            <div className="flex-col flex-auto px-2 py-1 border-1 rounded-xl max-w-[300px] space-between">
                                <div>
                                    <div className="mb-2 hook-label">{syncInfo.personHook.hook.label}</div>
                                    {syncInfo.personHook.fields.length > 0 && (
                                        <div className="flex flex-wrap gap-[4px] my-1">
                                            {syncInfo.personHook.fields
                                                .sort((a, b) => a.pipedrive.field_name.length - b.pipedrive.field_name.length)
                                                .map((field: HookField) => (
                                                    <FieldBadge key={field.id} field={field} />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-col flex-auto opacity-60 px-2 py-1 border-1 rounded-xl max-w-[300px] space-between">
                                <div>
                                    <div className="mb-2 hook-label">
                                        {translate("Persons - User Updated Hook")}
                                    </div>
                                    <div className="text-sm">
                                        {translate("⚠️ Not configured or not enabled")}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Organizations Category */}
                <div className="width-1/2">
                    <h3 className="mb-2 font-semibold text-lg">{translate("Organizations")}</h3>
                    <div className="flex flex-wrap gap-2">
                        {syncInfo.organizationHook ? (
                            <div className="flex-col flex-auto px-2 py-1 border-1 rounded-xl max-w-[300px] space-between">
                                <div>
                                    <div className="mb-2 hook-label">{syncInfo.organizationHook.hook.label}</div>
                                    {syncInfo.organizationHook.fields.length > 0 && (
                                        <div className="flex flex-wrap gap-[4px] my-1">
                                            {syncInfo.organizationHook.fields
                                                .sort((a, b) => a.pipedrive.field_name.length - b.pipedrive.field_name.length)
                                                .map((field: HookField) => (
                                                    <FieldBadge key={field.id} field={field} />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-col flex-auto opacity-60 px-2 py-1 border-1 rounded-xl max-w-[300px] space-between">
                                <div>
                                    <div className="mb-2 hook-label">
                                        {translate("Organizations - User Updated Hook")}
                                    </div>
                                    <div className="text-sm">
                                        {translate("⚠️ Not configured or not enabled")}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Orders Category */}
            <div className="mb-2">
                <h3 className="mb-2 font-semibold text-lg">{translate("Orders")}</h3>
                {syncInfo.dealHooks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {syncInfo.dealHooks.map((dealHookInfo) => (
                            <div
                                key={dealHookInfo.hook.id}
                                className="flex-col flex-auto px-2 py-1 border-1 rounded-xl max-w-[300px] space-between"
                            >
                                <div>
                                    <div className="mb-2 hook-label">{dealHookInfo.hook.label}</div>
                                    {dealHookInfo.fields.length > 0 && (
                                        <div className="flex flex-wrap gap-[4px] my-1">
                                            {dealHookInfo.fields
                                                .sort((a, b) => a.pipedrive.field_name.length - b.pipedrive.field_name.length)
                                                .map((field: HookField) => (
                                                    <FieldBadge key={field.id} field={field} />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm">
                        {translate("⚠️ No active hooks configured for orders")}
                    </div>
                )}
            </div>

            <p className="mt-2 mb-6">
                {translate("The synchronization of each order depends on its current status.")}
                <br />
                {translate("Only orders with configured status hooks will be synchronized.")}
            </p>

            <div className="flex justify-end gap-2 mt-6">
                <MainButton
                    onClick={onCancel}
                    style={3}
                    className="border-none"
                >
                    <div className="text-red-600">
                        {translate("Cancel")}
                    </div>
                </MainButton>
                <MainButton
                    onClick={onStart}
                    style={1}
                >
                    {translate("Start Synchronization")}
                </MainButton>
            </div>


        </div>
    )
}

