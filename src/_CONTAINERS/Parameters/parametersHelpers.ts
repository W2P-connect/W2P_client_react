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
    return isFieldTypeText(field.field_type)
        || field.field_type === "date"
        || isFieldTypeNumber(field.field_type)
} 