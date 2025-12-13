import { PipedriveField, PipedriveFieldType } from "Types";


export const filterUnusableFields = (fieldList: PipedriveField[]) => {
    return fieldList
}

export const isFieldTypeNumber = (fieldType: PipedriveFieldType) => {
    return fieldType === "monetary"
        || fieldType === "double"
        || fieldType === "int"
}

export const isFieldTypeText = (fieldType: PipedriveFieldType) => {
    return fieldType === "varchar"
        || fieldType === "address"
        || fieldType === "phone"
        || fieldType === "text"
        || fieldType === "varchar_options"

}

export const isLogicBlockField = (field: PipedriveField) => {
    return isFieldTypeText(field.field_type as PipedriveFieldType)
        || field.field_type === "date"
        || field.field_type === "time"
        || isFieldTypeNumber(field.field_type as PipedriveFieldType)
} 