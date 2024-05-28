import { useContext, useState, useEffect } from 'react'
import './pipedriveField.css'
import { isLogicBlockField, useHookSelector } from '../../../_CONTAINERS/Parameters/parametersHelpers'
import Skeleton from '../../GENERAL/Skeleton/Skeleton'
import InputCheckbox from '../../FORMS/InputCheckbox/InputCheckbox'
import { translate } from '../../../translation'
import { AppDataContext } from '../../../_CONTEXT/appDataContext'
import { useCallPipedriveApi } from '../../../helpers'
import LogicBlocks from '../../LOGICBLOCK/LogicBlocks'
import ConditionMaker from '../../ConditionMaker/ConditionMaker'
import { linkableFields } from '../../../appConstante'

export default function PipepdriveField({ pipedriveFieldId, relatedHook }) {

  const { getHookFieldFromPipedrive, setHookField } = useHookSelector()
  const { appData, setAppData } = useContext(AppDataContext)
  const callPipedriveApi = useCallPipedriveApi()

  const [field, setField] = useState(null)


  useEffect(() => {
    pipedriveFieldId === 12462 && console.log(relatedHook)
    const hookFromPipedrive = getHookFieldFromPipedrive(relatedHook.id, pipedriveFieldId)
    setField(prv => hookFromPipedrive)
  }, [appData.parameters.pipedrive[`${relatedHook.category}Fields`]])

  useEffect(() => {
    if (field) {
      setHookField(relatedHook.id, field)
    }
  }, [field])

  const updateField = (key, value) => {
    setField(prvField => ({ ...prvField, [key]: value }))
  }



  const loadPipedriveUsers = (e) => {
    callPipedriveApi("users", null, null, null, e)
      .then(res => {
        setAppData(prvData => {
          prvData.parameters.pipedrive.users = res.data.data
          return { ...prvData }
        })
      })
  }

  const loadPipedriveStages = (e) => {
    callPipedriveApi("stages", null, null, null, e)
      .then(res => {
        setAppData(prvData => {
          prvData.parameters.pipedrive.stages = res.data.data
          return { ...prvData }
        })
      })
  }

  /** Select d'un seul choix */
  const selectOption = (id) => {
    if (
      field.field_type === "enum" ||
      field.field_type === "user" ||
      field.field_type === "status" ||
      field.field_type === "stage"
    ) {
      setField(prvField => ({ ...prvField, value: id }))
    } else if (field.field_type === "set" || field.field_type === "visible_to") {
      field.value.includes(id)
        ? setField(prvField => ({ ...prvField, value: prvField.value.filter(val => val !== id) }))
        : setField(prvField => ({ ...prvField, value: [...prvField.value, id] }))
    }
  }

  const renderStages = () => {
    const groupedStages = appData.parameters.pipedrive.stages.reduce((acc, item) => {
      const { pipeline_name } = item;
      if (!acc[pipeline_name]) {
        acc[pipeline_name] = [];
      }
      acc[pipeline_name].push(item);
      return acc;
    }, {});

    const groupedStagesArray = Object.entries(groupedStages).map(([pipeline_name, stages]) => ({
      pipeline_name,
      stages
    }));

    return groupedStagesArray.map(group => (
      <div key={group.pipeline_name} className='flex column m-b-10'>
        <div className='strong-1 m-b-5'>{group.pipeline_name}</div>
        <div className='flex gap-1'>
          {
            group.stages.map(stage => (
              <div
                key={stage.id}
                onClick={e => selectOption(stage.id)}
                className={`pipedrive-option-field ${field.value === stage.id ? "selected" : ""}`}
                style={{ backgroundColor: stage.color ? stage.color : "white" }}
              >
                {stage.name}
              </div>
            ))
          }
        </div>
      </div>
    ));
  }

  return (
    <div className='pipedrive-field' key={pipedriveFieldId}>
      {field
        ? <>
          <div className='space-between flex-center'>
            <div className='field-name'>
              <InputCheckbox
                checked={field.enabled}
                onChange={(value) => updateField("enabled", value)}
              />
              {field.important_flag
                ? <span>🚨</span>
                : null}
              {`${field.name} `}
              (<span className='subtext'>
                {field.key} - {field.field_type}
              </span>)
            </div>
            {/* <div className='italic'>
              {field.enabled && field.value[0]
                ? getBlockExemple(field.value[0])
                : null}
            </div> */}
          </div>
          {field.enabled
            ? <div>
              {field.required
                ? <p>{translate(`This field is required for creating a ${relatedHook.category}.
                If the value is null, no call will be made to Pipedrive for creation`)}</p>
                : null}

              {/* <h5 className='strong-1 m-t-25 m-b-25'>
                {translate("Value")}
              </h5> */}
              {/* <div className='strong-1 m-t-10 m-b-10'>Assigned value</div> */}

              {/* FIELDTYPE SET */}
              {field.field_type === "set"
                ? field.options && field.options.length
                  ? <div className='pipedrive-option-field-container'> {
                    field.options.map((option, index) =>
                      <div
                        key={index}
                        onClick={e => selectOption(option.id)}
                        className={`pipedrive-option-field ${field.value.includes(option.id) ? "selected" : ""}`}
                        style={{ backgroundColor: option.color ? option.color : "white" }}
                      >{option.label}</div>
                    )
                  }
                  </div>
                  : <div className='m-t-10'>{translate("There is no option defined on Pipedrive for this field.")}</div>
                : null
              }
              {/* FIELDTYPE ENUM */}
              {(field.field_type === "enum" || field.field_type === "status")
                ? field.options
                  ? <div className='pipedrive-option-field-container'> {
                    field.options.map((option, index) =>
                      <div
                        key={index}
                        onClick={e => selectOption(option.id)}
                        className={`pipedrive-option-field ${field.value === option.id ? "selected" : ""}`}
                        style={{ backgroundColor: option.color ? option.color : "white" }}
                      >{option.label}</div>
                    )
                  }
                  </div>
                  : null
                : null
              }
              {/* FIELDTYPE VARCHAR / ADRESS */}
              {isLogicBlockField(field)
                ? <LogicBlocks
                  fieldCondition={field.condition}
                  setter={(logicBlocks) => updateField("value", logicBlocks)}
                  defaultLogicBlocks={field.value}
                />
                : null
              }

              {/* FIELDTYPE VISIBLE_TO */}
              {(field.field_type === "visible_to")
                ? appData.parameters.pipedrive.users.length
                  ? <div className='pipedrive-option-field-container'> {
                    appData.parameters.pipedrive.users.map((user, index) =>
                      <div
                        key={index}
                        onClick={e => selectOption(user.id)}
                        className={`pipedrive-option-field ${field.value.includes(user.id) ? "selected" : ""}`}
                        style={{ backgroundColor: user.color ? user.color : "white" }}
                      >{user.name}</div>
                    )
                  }
                  </div>
                  : <button
                    type='button'
                    className='light-button'
                    onClick={e => loadPipedriveUsers(e)}
                  >
                    {translate("Load pipedrive's users")}
                  </button>
                : null
              }

              {/* FIELDTYPE USER */}
              {(field.field_type === "user")
                ? <>
                  <div className='pipedrive-option-field-container'> {
                    appData.parameters.pipedrive.users.map((user, index) =>
                      <div
                        key={index}
                        onClick={e => selectOption(user.id)}
                        className={`pipedrive-option-field ${field.value === user.id ? "selected" : ""}`}
                        style={{ backgroundColor: user.color ? user.color : "white" }}
                      >{user.name}</div>
                    )
                  }
                  </div>
                  <button
                    type='button'
                    className='light-button'
                    onClick={e => loadPipedriveUsers(e)}
                  >
                    {appData.parameters.pipedrive.users.length
                      ? translate("Reload pipedrive's users")
                      : translate("Load pipedrive's users")}
                  </button>
                </>
                : null
              }

              {/* FIELDTYPE STAGE */}
              {(field.field_type === "stage")
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
                    {appData.parameters.pipedrive.stages.length
                      ? translate("Reload pipedrive's stages")
                      : translate("Load pipedrive's stages")}
                  </button>
                </>
                : null
              }

              <div>
                {isLogicBlockField(field)
                  ? <>
                    <h5 className='strong-1 m-t-40 m-b-10'>
                      {translate("Condition")}
                    </h5>
                    <ConditionMaker
                      condition={field.condition}
                      setter={condition => setField(prv => ({ ...prv, condition: condition }))}
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
                linkableFields[relatedHook.category]?.includes(field.key)
                  ? <div className='m-t-10'>
                    <label>
                      <input
                        type='checkbox'
                        // className='w2p-normal-checkbox'
                        onChange={e => setField(prv => ({ ...prv, findInPipedrive: e.target.checked }))}
                        checked={field.findInPipedrive}
                      />
                      {relatedHook.category === "person"
                        ? translate(`If a person already has this value for this field in Pipedrive, 
                      then link the Woocommerce account to that person. (only if the Woocommerce account is not already linked).`)
                        : relatedHook.category === "organization"
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
        </>
        : <Skeleton height={'100px'} />
      }
    </div>
  )
}