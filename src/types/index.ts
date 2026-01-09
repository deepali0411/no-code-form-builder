/**
 * Core type definitions for the form builder
 * This file contains all the fundamental types used throughout the application
 */

/**
 * Supported field types in the form builder
 * Each type corresponds to a specific field component and validation rules
 */
export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'file'
    | 'switch'
    | 'rating'
    | 'range'
    | 'hidden'
    | 'section'
    | 'conditional';

/**
 * Field categories for organization in the field palette
 */
export type FieldCategory = 'input' | 'choice' | 'layout' | 'special';

/**
 * Conditional logic operators for field visibility rules
 */
export type ConditionOperator =
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'notContains'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
    | 'isEmpty'
    | 'isNotEmpty';

/**
 * Logic operator for combining multiple conditions
 */
export type LogicOperator = 'AND' | 'OR';

/**
 * Validation rule types
 */
export type ValidationType =
    | 'required'
    | 'minLength'
    | 'maxLength'
    | 'min'
    | 'max'
    | 'pattern'
    | 'email'
    | 'url'
    | 'custom';

/**
 * Single validation rule definition
 */
export interface ValidationRule {
    type: ValidationType;
    value?: string | number;
    message: string;
    async?: boolean;
}

/**
 * Conditional visibility rule for a field
 */
export interface ConditionalRule {
    field: string; // ID of the field to check
    operator: ConditionOperator;
    value: unknown;
}

/**
 * Conditional visibility configuration
 */
export interface FieldConditions {
    show: boolean; // Default visibility
    rules: ConditionalRule[];
    logic: LogicOperator;
}

/**
 * Base field configuration shared by all field types
 */
export interface BaseFieldConfig {
    placeholder?: string;
    required?: boolean;
    defaultValue?: unknown;
    disabled?: boolean;
    readonly?: boolean;
    validation?: ValidationRule[];
    helpText?: string;
}

/**
 * Text field specific configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}

/**
 * Number field specific configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
    min?: number;
    max?: number;
    step?: number;
}

/**
 * Select/Radio/Checkbox field option
 */
export interface FieldOption {
    label: string;
    value: string;
    disabled?: boolean;
}

/**
 * Select field specific configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
    options: FieldOption[];
    multiple?: boolean;
    searchable?: boolean;
}

/**
 * Radio group field specific configuration
 */
export interface RadioFieldConfig extends BaseFieldConfig {
    options: FieldOption[];
    inline?: boolean;
}

/**
 * Checkbox group field specific configuration
 */
export interface CheckboxFieldConfig extends BaseFieldConfig {
    options: FieldOption[];
    inline?: boolean;
    minSelections?: number;
    maxSelections?: number;
}

/**
 * File upload field specific configuration
 */
export interface FileFieldConfig extends BaseFieldConfig {
    accept?: string; // MIME types
    maxSize?: number; // in bytes
    multiple?: boolean;
}

/**
 * Rating field specific configuration
 */
export interface RatingFieldConfig extends BaseFieldConfig {
    maxRating?: number;
    icon?: 'star' | 'heart' | 'thumb';
}

/**
 * Range field specific configuration
 */
export interface RangeFieldConfig extends BaseFieldConfig {
    min: number;
    max: number;
    step?: number;
    showValue?: boolean;
}

/**
 * Section field specific configuration
 */
export interface SectionFieldConfig {
    heading?: string;
    description?: string;
    divider?: boolean;
}

/**
 * Union type of all possible field configurations
 */
export type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | RadioFieldConfig
    | CheckboxFieldConfig
    | FileFieldConfig
    | RatingFieldConfig
    | RangeFieldConfig
    | SectionFieldConfig
    | BaseFieldConfig;

/**
 * Complete field schema definition
 */
export interface FieldSchema {
    id: string; // UUID
    type: FieldType;
    label: string;
    config: FieldConfig;
    conditions?: FieldConditions;
    order: number; // For sorting in the canvas
}

/**
 * Form metadata
 */
export interface FormMetadata {
    title: string;
    description?: string;
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
}

/**
 * Form settings
 */
export interface FormSettings {
    submitButton: {
        text: string;
        enabled: boolean;
    };
    successMessage: string;
    redirectUrl?: string;
}

/**
 * Complete form schema definition
 */
export interface FormSchema {
    version: string; // Schema version for migration
    id: string; // UUID
    metadata: FormMetadata;
    fields: FieldSchema[];
    settings: FormSettings;
}

/**
 * Validation result for a field
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
    valid: boolean;
    errors: Record<string, string>; // fieldId -> error message
}

/**
 * Field value type (can be any JSON-serializable value)
 */
export type FieldValue = string | number | boolean | string[] | File | File[] | null | undefined;

/**
 * Form data structure (field values)
 */
export type FormData = Record<string, FieldValue>;

/**
 * Builder mode
 */
export type BuilderMode = 'builder' | 'preview';

/**
 * Render mode for field components
 */
export type RenderMode = 'builder' | 'preview' | 'runtime';

/**
 * Drag and drop item type
 */
export interface DragItem {
    id: string;
    type: 'new-field' | 'existing-field';
    fieldType?: FieldType;
}

/**
 * Field registry definition
 */
export interface FieldDefinition {
    type: FieldType;
    category: FieldCategory;
    icon: string; // Icon name or emoji
    label: string;
    description: string;
    defaultConfig: FieldConfig;
}

/**
 * Persistence layer types
 */
export interface SavedForm {
    id: string;
    schema: FormSchema;
    savedAt: string;
}

export interface PersistenceAdapter {
    save: (form: FormSchema) => Promise<void>;
    load: (id: string) => Promise<FormSchema | null>;
    list: () => Promise<SavedForm[]>;
    delete: (id: string) => Promise<void>;
}
