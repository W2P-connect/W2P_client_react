import './hookField.css'
import { isLogicBlockField } from '../../../_CONTAINERS/Parameters/parametersHelpers'
import InputCheckbox from '../../FORMS/InputCheckbox/InputCheckbox'
import { translate } from '../../../translation'
import { classNames, isNumberArray, mayJsonParse, useCallPipedriveApi } from '../../../helpers'
import LogicBlocks from '../../LOGICBLOCK/LogicBlocks'
import ConditionMaker from '../../ConditionMaker/ConditionMaker'
import { additionalFieldsData, linkableFields } from '../../../appConstante'
import { HookField as HookFieldType, Block, GroupedStages } from 'Types'
import { hookFieldStore } from '_STORES/HookField'
import { hookStore } from '_STORES/Hooks'
import { appDataStore } from '_STORES/AppData'
import { FormEvent, MouseEvent, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { getBlockExemple } from '_COMPONENTS/LOGICBLOCK/VariableBlock'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Props {
  hookField: HookFieldType
}

const HookField = ({ hookField }: Props) => {

  const callPipedriveApi = useCallPipedriveApi()

  const [open, setOpen] = useState<boolean>(false)

  // const field = useRef(hookField)

  const selectedHook = useMemo(() => hookStore.getHook(hookField.hookId), [hookField])

  const updateHookField = (key: keyof HookFieldType, value: any) => {
    if (key === 'enabled') {
      if (value === true) {
        setOpen(_ => true)
      } else {
        setOpen(_ => false)
      }
    }
    // field.current = { ...field.current, [key]: value }
    selectedHook && hookStore.updateHookField(selectedHook, hookField.id, { [key]: value });
  };

  const updateOptionHookField = (key: keyof HookFieldType["condition"], value: any) => {
    selectedHook && hookStore.updateHookField(selectedHook, hookField.id, { condition: { ...hookField.condition, [key]: value } });
  };

  const loadPipedriveUsers = (e: React.FormEvent) => {
    callPipedriveApi("users", null, null, null, e)
      .then(res => {
        if (res) {
          const newAppDataStore = appDataStore.appData
          newAppDataStore.parameters.pipedrive.users = res.data.data
          appDataStore.setAppData(newAppDataStore)
        }
      })
  }

  const loadPipedriveStages = (e: FormEvent) => {
    callPipedriveApi("stages", null, null, null, e)
      .then(res => {
        if (res) {
          const newAppDataStore = appDataStore.appData
          newAppDataStore.parameters.pipedrive.stages = res.data.data
          appDataStore.setAppData(newAppDataStore)
        }
      })
  }

  /** Select d'un seul choix */
  const selectOption = (id: number) => {
    if (
      hookField.pipedrive.field_type === "enum" ||
      hookField.pipedrive.field_type === "user" ||
      hookField.pipedrive.field_type === "status" ||
      hookField.pipedrive.field_type === "stage"
    ) {
      updateHookField('value', id)
    } else if (hookField.pipedrive.field_type === "set" || hookField.pipedrive.field_type === "visible_to") {
      if (Array.isArray(hookField.value)) {
        if (isNumberArray(hookField.value) && hookField.value.includes(id)) {
          updateHookField('value', hookField.value.filter(val => val !== id));
        } else {
          updateHookField('value', [...hookField.value, id]);
        }
      } else {
        updateHookField('value', [id]);
      }
    }
  }

  const renderStages = () => {
    // Typage explicite du résultat de reduce
    const groupedStages: GroupedStages = appDataStore.appData.parameters.pipedrive.stages.reduce((acc, item) => {
      const { pipeline_name } = item;
      if (!acc[pipeline_name]) {
        acc[pipeline_name] = [];
      }
      acc[pipeline_name].push(item);
      return acc;
    }, {} as GroupedStages);  // Type de l'accumulateur explicitement défini

    // Transformation de l'objet en tableau
    const groupedStagesArray = Object.entries(groupedStages).map(([pipeline_name, stages]) => ({
      pipeline_name,
      stages
    }));

    // Rendu JSX
    return groupedStagesArray.map(group => (
      <div key={group.pipeline_name} className='flex m-b-10 column'>
        <div className='m-b-5 strong-1'>{group.pipeline_name}</div>
        <div className='flex gap-1'>
          {
            group.stages.map(stage => (
              <div
                key={stage.id}
                onClick={() => selectOption(stage.id)}
                className={`pipedrive-option-field ${hookField.value === stage.id ? "selected" : ""}`}
                style={{ backgroundColor: "white" }}
              >
                {stage.name}
              </div>
            ))
          }
        </div>
      </div>
    ));
  };

  return (
    <div className='pipedrive-field'>
      <div className='flex items-center'>
        <InputCheckbox
          checked={hookField.enabled}
          onChange={(value) => updateHookField("enabled", value)}
        />

        <div
          onClick={_ => setOpen(prv => !prv)}
          className='flex justify-between items-center w-full cursor-pointer' >
          <div className='font-medium text-base'>
            {hookFieldStore.isImportant(hookField)
              ? <span>🚨</span>
              : null}
            {`${hookField.pipedrive.name} `}
            {/* (<span className='subtext'>
              {hookField.pipedrive.key} - {hookField.pipedrive.field_type}
            </span>) */}
          </div>

          <div className='flex gap-5'>
            {hookField.enabled
              ? <div className='italic'>
                <div className={
                  classNames(
                    !open ? "opacity-100" : "opacity-0",
                    "transition-opacity"
                  )}>
                  {Array.isArray(hookField.value) && hookField.value.length && typeof hookField.value[0] !== "number"
                    ? getBlockExemple(hookField.value[0])
                    : mayJsonParse(`${hookField.value}`, hookField.value)
                  }
                </div>

              </div>
              : null}
            {hookField.enabled
              ? <div
                className={`${open ? "rotate-0" : "-rotate-90"} transition-transform cursor-pointer`} >
                <ChevronDownIcon width={15} />
              </div>
              : null}
          </div>
        </div>
      </div>
      {selectedHook && hookField.enabled && open
        ? <div>
          {/* {hookFieldStore.isRequired(hookField)
            ? <p>{translate(`This field is required for creating a ${selectedHook?.category}.
                If the value is null, no call will be made to Pipedrive for creation`)}</p>
            : null} */}

          {additionalFieldsData[selectedHook.category][hookField.pipedrive.key]?.info
            ? <p>{additionalFieldsData[selectedHook.category][hookField.pipedrive.key].info}</p>
            : null}

          {/* FIELDTYPE SET */}
          {hookField.pipedrive.field_type === "set"
            ? hookField.pipedrive.options && hookField.pipedrive.options.length
              ? <div className='pipedrive-option-field-container'> {
                hookField.pipedrive.options.map((option, index) =>
                  <div
                    key={index}
                    onClick={e => selectOption(option.id)}
                    className={`pipedrive-option-field ${(isNumberArray(hookField.value) && hookField.value.includes(option.id))
                      ? "selected"
                      : ""}`}
                    style={{ backgroundColor: option.color ? option.color : "white" }}
                  >{option.label}</div>
                )
              }
              </div>
              : <div className='m-t-10'>{translate("There is no option defined on Pipedrive for this field.")}</div>
            : null
          }
          {/* FIELDTYPE ENUM */}
          {(hookField.pipedrive.field_type === "enum" || hookField.pipedrive.field_type === "status")
            ? hookField.pipedrive.options
              ? <div className='pipedrive-option-field-container'> {
                hookField.pipedrive.options.map((option, index) =>
                  <div
                    key={index}
                    onClick={e => selectOption(option.id)}
                    className={`pipedrive-option-field ${hookField.value === option.id ? "selected" : ""}`}
                    style={{ backgroundColor: option.color ? option.color : "white" }}
                  >{option.label}</div>
                )
              }
              </div>
              : null
            : null
          }
          {/* FIELDTYPE VARCHAR / ADRESS */}
          {isLogicBlockField(hookField.pipedrive)
            ? <LogicBlocks
              fieldCondition={hookField.condition}
              setter={(logicBlocks) => updateHookField("value", logicBlocks)}
              defaultLogicBlocks={hookField.value as Block[]}
            />
            : null
          }

          {/* FIELDTYPE VISIBLE_TO */}
          {(hookField.pipedrive.field_type === "visible_to")
            ? appDataStore.appData.parameters.pipedrive.users.length
              ? <div className='pipedrive-option-field-container'> {
                appDataStore.appData.parameters.pipedrive.users.map((user, index) =>
                  <div
                    key={index}
                    onClick={e => selectOption(user.id)}
                    className={`pipedrive-option-field ${(isNumberArray(hookField.value) && hookField.value.includes(user.id))
                      ? "selected"
                      : ""}`}
                    style={{ backgroundColor: "white" }}
                  >{user.name}</div>
                )
              }
              </div>
              : <form onSubmit={e => loadPipedriveUsers(e)}>
                <button
                  className='light-button'
                >
                  {appDataStore.appData.parameters.pipedrive.users.length
                    ? translate("Reload pipedrive's users")
                    : translate("Load pipedrive's users")
                  }
                </button>
              </form>
            : null
          }

          {/* FIELDTYPE USER */}
          {(hookField.pipedrive.field_type === "user")
            ? <>
              <div className='pipedrive-option-field-container'> {
                appDataStore.appData.parameters.pipedrive.users.map((user, index) =>
                  <div
                    key={index}
                    onClick={e => selectOption(user.id)}
                    className={`pipedrive-option-field ${hookField.value === user.id ? "selected" : ""}`}
                    style={{ backgroundColor: "white" }}
                  >{user.name}</div>
                )
              }
              </div>
              <form onSubmit={e => loadPipedriveUsers(e)}>
                <button
                  className='light-button'
                >
                  {appDataStore.appData.parameters.pipedrive.users.length
                    ? translate("Reload pipedrive's users")
                    : translate("Load pipedrive's users")
                  }
                </button>
              </form>
            </>
            : null
          }

          {/* FIELDTYPE STAGE */}
          {(hookField.pipedrive.field_type === "stage")
            ? <>
              <div className='pipedrive-option-field-container'> {
                renderStages()
              }
              </div>
              <form onSubmit={e => loadPipedriveStages(e)}>
                <button
                  className='light-button'
                >
                  {appDataStore.appData.parameters.pipedrive.stages.length
                    ? translate("Reload pipedrive's stages")
                    : translate("Load pipedrive's stages")}
                </button>
              </form>
            </>
            : null
          }

          <div>
            <h5 className='m-b-10 m-t-40 strong-1'>
              {translate("Condition")}
            </h5>
            <div className='flex flex-col gap-2'>
              <div className='mb-2'>
                {isLogicBlockField(hookField.pipedrive)
                  ? <>
                    <ConditionMaker
                      logicBlockCondition={hookField.condition.logicBlock}
                      setter={condition => updateOptionHookField("logicBlock", condition)}
                    />
                  </>
                  : null
                }
              </div>

              <div>
                <label className='flex items-center gap-1 cursor-pointer'>
                  <input
                    type='checkbox'
                    // className='w2p-normal-checkbox'
                    // value={''}
                    onChange={e => updateOptionHookField("SkipOnExist", e.target.checked)}
                    checked={hookField.condition.SkipOnExist ?? false}
                  />
                  {translate("Do not update if there is already a value for this field on Pipedrive")}
                </label>
              </div>

              <div>
                {
                  linkableFields[selectedHook.category].includes(hookField.pipedrive.key)
                    ? <label className='flex items-center gap-1'>
                      <input
                        type='checkbox'
                        // className='w2p-normal-checkbox'
                        // value={''}
                        onChange={e => updateOptionHookField("findInPipedrive", e.target.checked)}
                        checked={hookField.condition.findInPipedrive ?? false}
                      />
                      {selectedHook.category === "person"
                        ? translate(` If a person in Pipedrive already has this value for this field, link their WooCommerce account to that person. (only if it's not already linked).`)
                        : selectedHook.category === "organization"
                          ? translate(` If an organization in Pipedrive already has this value for this field, link their WooCommerce account to that person. (only if it's not already linked).`)
                          : selectedHook.category === "deal"
                            ? translate(` If a deal in Pipedrive already has this value for this field, link the WooCommerce account to that deal. (only if it's not already linked).`)
                            : null
                      }
                    </label>
                    : null
                }
              </div>
            </div>
          </div>
        </div>
        : null}
    </div>
  )
}

export default observer(HookField)