import './hookField.css'
import { isLogicBlockField } from '../../../_CONTAINERS/Parameters/parametersHelpers'
import InputCheckbox from '../../FORMS/InputCheckbox/InputCheckbox'
import { translate } from '../../../translation'
import { isNumberArray, useCallPipedriveApi } from '../../../helpers'
import LogicBlocks from '../../LOGICBLOCK/LogicBlocks'
import ConditionMaker from '../../ConditionMaker/ConditionMaker'
import { additionalFieldsData, linkableFields } from '../../../appConstante'
import { HookField as HookFieldType, Block, GroupedStages } from 'Types'
import { hookFieldStore } from '_STORES/HookField'
import { hookStore } from '_STORES/Hooks'
import { appDataStore } from '_STORES/AppData'
import { MouseEvent } from 'react'

interface Props {
  hookField: HookFieldType
}

export default function HookField({ hookField }: Props) {

  const callPipedriveApi = useCallPipedriveApi()


  const hook = hookStore.getHook(hookField.hookId)

  const updateHookField = (key: keyof HookFieldType, value: any) => {
    hookFieldStore.updateHookField(hookField.id, { [key]: value });
  };

  const loadPipedriveUsers = (e: MouseEvent) => {
    callPipedriveApi("users", null, null, null, e)
      .then(res => {
        if (res) {
          const newAppDataStore = appDataStore.appData
          newAppDataStore.parameters.pipedrive.users = res.data.data
          appDataStore.setAppData(newAppDataStore)
        }
      })
  }

  const loadPipedriveStages = (e: MouseEvent) => {
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
        isNumberArray(hookField.value) && hookField.value.includes(id)
          ? updateHookField('value', Array.isArray(hookField.value) ? hookField.value.filter(val => val !== id) : [])
          : updateHookField("value", id)
      } else {
        updateHookField("value", [id]); // or handle the case where it's not an array
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
      <div key={group.pipeline_name} className='flex column m-b-10'>
        <div className='strong-1 m-b-5'>{group.pipeline_name}</div>
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
      <div className='space-between flex-center'>
        <div className='field-name'>
          <InputCheckbox
            checked={hookField.enabled}
            onChange={(value) => updateHookField("enabled", value)}
          />
          {hookFieldStore.isImportant(hookField)
            ? <span>🚨</span>
            : null}
          {`${hookField.pipedrive.name} `}
          (<span className='subtext'>
            {hookField.pipedrive.key} - {hookField.pipedrive.field_type}
          </span>)
        </div>
        {/* <div className='italic'>
              {field.enabled && field.value[0]
                ? getBlockExemple(field.value[0])
                : null}
            </div> */}
      </div>
      {hook && hookField.enabled
        ? <div>
          {hookFieldStore.isRequired(hookField)
            ? <p>{translate(`This field is required for creating a ${hook?.category}.
                If the value is null, no call will be made to Pipedrive for creation`)}</p>
            : null}

          {additionalFieldsData[hook.category][hookField.pipedrive.key]?.info
            ? <p>{additionalFieldsData[hook.category][hookField.pipedrive.key].info}</p>
            : null}

          {/* <h5 className='strong-1 m-t-25 m-b-25'>
                {translate("Value")}
              </h5> */}
          {/* <div className='strong-1 m-t-10 m-b-10'>Assigned value</div> */}

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
              : <button
                type='button'
                className='light-button'
                onClick={e => loadPipedriveUsers(e)}
              >
                {appDataStore.appData.parameters.pipedrive.users.length
                  ? translate("Reload pipedrive's users")
                  : translate("Load pipedrive's users")
                }
              </button>
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
              <button
                type='button'
                className='light-button'
                onClick={e => loadPipedriveUsers(e)}
              >
                {appDataStore.appData.parameters.pipedrive.users.length
                  ? translate("Reload pipedrive's users")
                  : translate("Load pipedrive's users")}
              </button>
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
              <button
                type='button'
                className='light-button'
                onClick={e => loadPipedriveStages(e)}
              >
                {appDataStore.appData.parameters.pipedrive.stages.length
                  ? translate("Reload pipedrive's stages")
                  : translate("Load pipedrive's stages")}
              </button>
            </>
            : null
          }

          <div>
            <h5 className='strong-1 m-t-40 m-b-10'>
              {translate("Condition")}
            </h5>
            <label>
              {translate("Do not update if there is already a value for this field on Pipedrive")}
            </label>
            {isLogicBlockField(hookField.pipedrive)
              ? <>

                <ConditionMaker
                  condition={hookField.condition}
                  setter={condition => updateHookField("condition", condition)}
                />
              </>
              : null
            }
          </div>
          {/* <div>
                <label>
                  <input
                    type='checkbox'
                    // className='w2p-normal-checkbox'
                    onChange={e => setField(prv => ({ ...prv, sendIfEmpty: e.target.checked }))}
                    checked={field.sendIfEmpty}
                  />
                  {translate("Send to Pipedrive even if any field is incomplete")}
                </label>
              </div> */}
          {
            linkableFields[hook.category].includes(hookField.pipedrive.key)
              ? <div className='m-t-10'>
                <label>
                  <input
                    type='checkbox'
                    // className='w2p-normal-checkbox'
                    onChange={e => updateHookField("findInPipedrive", e.target.checked)}
                    checked={hookField.findInPipedrive}
                  />
                  {hook.category === "person"
                    ? translate(`If a person already has this value for this field in Pipedrive, 
                      then link the Woocommerce account to that person. (only if the Woocommerce account is not already linked).`)
                    : hook.category === "organization"
                      ? translate(`If an organization already has this value for this field in Pipedrive, 
                        then link the Woocommerce account to that organization. (only if the Woocommerce account is not already linked).`)
                      : null //deal donc tchi
                  }
                </label>
              </div>
              : null
          }
          {/* <ConditionMaker
                  condition={field.condition}
                  setter={(value) => updateField("condition", value)}
                  type={field.field_type}
                  option={field.options ?? []}
                /> */}

        </div>
        : null}
    </div>
  )
}