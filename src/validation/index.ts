/**
 * Validation engine for form fields
 * Handles real-time, on-blur, and on-submit validation
 */

import type { FieldSchema, ValidationRule, ValidationResult, FormValidationResult, FormData, FieldValue } from '../types';
import { ERROR_MESSAGES } from '../constants';

/**
 * Validate a single field value against its validation rules
 */
export function validateField(
    field: FieldSchema,
    value: FieldValue,
    allFormData?: FormData
): ValidationResult {
    const { config } = field;

    // Check if field has validation rules
    const validation = 'validation' in config ? config.validation : undefined;
    const required = 'required' in config ? config.required : false;

    // Required validation
    if (required && isEmpty(value)) {
        return {
            valid: false,
            error: ERROR_MESSAGES.REQUIRED,
        };
    }

    // If empty and not required, it's valid
    if (isEmpty(value)) {
        return { valid: true };
    }

    // Run through validation rules
    if (validation && Array.isArray(validation)) {
        for (const rule of validation) {
            const result = validateRule(rule, value, field);
            if (!result.valid) {
                return result;
            }
        }
    }

    // Field-specific validation
    const fieldTypeResult = validateFieldType(field, value);
    if (!fieldTypeResult.valid) {
        return fieldTypeResult;
    }

    return { valid: true };
}

/**
 * Validate a single validation rule
 */
function validateRule(rule: ValidationRule, value: FieldValue, field: FieldSchema): ValidationResult {
    switch (rule.type) {
        case 'required':
            return isEmpty(value)
                ? { valid: false, error: rule.message || ERROR_MESSAGES.REQUIRED }
                : { valid: true };

        case 'minLength':
            if (typeof value === 'string' && typeof rule.value === 'number') {
                return value.length < rule.value
                    ? { valid: false, error: rule.message || ERROR_MESSAGES.MIN_LENGTH(rule.value) }
                    : { valid: true };
            }
            return { valid: true };

        case 'maxLength':
            if (typeof value === 'string' && typeof rule.value === 'number') {
                return value.length > rule.value
                    ? { valid: false, error: rule.message || ERROR_MESSAGES.MAX_LENGTH(rule.value) }
                    : { valid: true };
            }
            return { valid: true };

        case 'min':
            if (typeof value === 'number' && typeof rule.value === 'number') {
                return value < rule.value
                    ? { valid: false, error: rule.message || ERROR_MESSAGES.MIN_VALUE(rule.value) }
                    : { valid: true };
            }
            return { valid: true };

        case 'max':
            if (typeof value === 'number' && typeof rule.value === 'number') {
                return value > rule.value
                    ? { valid: false, error: rule.message || ERROR_MESSAGES.MAX_VALUE(rule.value) }
                    : { valid: true };
            }
            return { valid: true };

        case 'pattern':
            if (typeof value === 'string' && typeof rule.value === 'string') {
                try {
                    const regex = new RegExp(rule.value);
                    return !regex.test(value)
                        ? { valid: false, error: rule.message || ERROR_MESSAGES.PATTERN_MISMATCH }
                        : { valid: true };
                } catch (error) {
                    // Invalid regex pattern
                    console.error('Invalid regex pattern:', rule.value, error);
                    return { valid: true }; // Skip invalid patterns
                }
            }
            return { valid: true };

        case 'email':
            if (typeof value === 'string') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !emailRegex.test(value)
                    ? { valid: false, error: rule.message || ERROR_MESSAGES.INVALID_EMAIL }
                    : { valid: true };
            }
            return { valid: true };

        case 'url':
            if (typeof value === 'string') {
                try {
                    new URL(value);
                    return { valid: true };
                } catch {
                    return { valid: false, error: rule.message || ERROR_MESSAGES.INVALID_URL };
                }
            }
            return { valid: true };

        case 'custom':
            // Custom validation would be implemented here
            // For now, we'll assume it's valid
            return { valid: true };

        default:
            return { valid: true };
    }
}

/**
 * Field-type specific validation
 */
function validateFieldType(field: FieldSchema, value: FieldValue): ValidationResult {
    const { type, config } = field;

    switch (type) {
        case 'email':
            if (typeof value === 'string') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
                }
            }
            break;

        case 'number':
            if ('min' in config && typeof config.min === 'number' && typeof value === 'number') {
                if (value < config.min) {
                    return { valid: false, error: ERROR_MESSAGES.MIN_VALUE(config.min) };
                }
            }
            if ('max' in config && typeof config.max === 'number' && typeof value === 'number') {
                if (value > config.max) {
                    return { valid: false, error: ERROR_MESSAGES.MAX_VALUE(config.max) };
                }
            }
            break;

        case 'file':
            if ('maxSize' in config && typeof config.maxSize === 'number') {
                if (value instanceof File) {
                    if (value.size > config.maxSize) {
                        const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
                        return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE(parseFloat(maxSizeMB)) };
                    }
                } else if (Array.isArray(value)) {
                    for (const file of value) {
                        if (file instanceof File && file.size > config.maxSize) {
                            const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
                            return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE(parseFloat(maxSizeMB)) };
                        }
                    }
                }
            }

            if ('accept' in config && typeof config.accept === 'string') {
                const acceptedTypes = config.accept.split(',').map((t) => t.trim());
                if (value instanceof File) {
                    if (!isFileTypeAccepted(value, acceptedTypes)) {
                        return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
                    }
                } else if (Array.isArray(value)) {
                    for (const file of value) {
                        if (file instanceof File && !isFileTypeAccepted(file, acceptedTypes)) {
                            return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
                        }
                    }
                }
            }
            break;

        case 'checkbox':
            if ('minSelections' in config && typeof config.minSelections === 'number') {
                const selections = Array.isArray(value) ? value.length : 0;
                if (selections < config.minSelections) {
                    return { valid: false, error: ERROR_MESSAGES.MIN_SELECTIONS(config.minSelections) };
                }
            }
            if ('maxSelections' in config && typeof config.maxSelections === 'number') {
                const selections = Array.isArray(value) ? value.length : 0;
                if (selections > config.maxSelections) {
                    return { valid: false, error: ERROR_MESSAGES.MAX_SELECTIONS(config.maxSelections) };
                }
            }
            break;
    }

    return { valid: true };
}

/**
 * Validate entire form
 */
export function validateForm(fields: FieldSchema[], formData: FormData): FormValidationResult {
    const errors: Record<string, string> = {};

    for (const field of fields) {
        // Skip hidden and section fields
        if (field.type === 'hidden' || field.type === 'section') {
            continue;
        }

        // Check visibility conditions
        if (field.conditions && !evaluateConditions(field, formData, fields)) {
            continue; // Skip validation for hidden fields
        }

        const value = formData[field.id];
        const result = validateField(field, value, formData);

        if (!result.valid && result.error) {
            errors[field.id] = result.error;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Evaluate conditional visibility rules
 * Returns true if field should be visible
 */
export function evaluateConditions(
    field: FieldSchema,
    formData: FormData,
    allFields: FieldSchema[]
): boolean {
    if (!field.conditions) {
        return true; // No conditions = always visible
    }

    const { show, rules, logic } = field.conditions;

    if (rules.length === 0) {
        return show;
    }

    const results = rules.map((rule) => {
        const dependentValue = formData[rule.field];
        return evaluateCondition(rule.operator, dependentValue, rule.value);
    });

    const conditionMet =
        logic === 'AND' ? results.every((r) => r) : results.some((r) => r);

    return conditionMet;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(operator: string, fieldValue: unknown, compareValue: unknown): boolean {
    switch (operator) {
        case 'equals':
            return fieldValue === compareValue;

        case 'notEquals':
            return fieldValue !== compareValue;

        case 'contains':
            if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
                return fieldValue.includes(compareValue);
            }
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(compareValue);
            }
            return false;

        case 'notContains':
            if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
                return !fieldValue.includes(compareValue);
            }
            if (Array.isArray(fieldValue)) {
                return !fieldValue.includes(compareValue);
            }
            return true;

        case 'greaterThan':
            if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
                return fieldValue > compareValue;
            }
            return false;

        case 'lessThan':
            if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
                return fieldValue < compareValue;
            }
            return false;

        case 'greaterThanOrEqual':
            if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
                return fieldValue >= compareValue;
            }
            return false;

        case 'lessThanOrEqual':
            if (typeof fieldValue === 'number' && typeof compareValue === 'number') {
                return fieldValue <= compareValue;
            }
            return false;

        case 'isEmpty':
            return isEmpty(fieldValue);

        case 'isNotEmpty':
            return !isEmpty(fieldValue);

        default:
            return false;
    }
}

/**
 * Check if a value is empty
 */
function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        return value.trim() === '';
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    return false;
}

/**
 * Check if file type is accepted
 */
function isFileTypeAccepted(file: File, acceptedTypes: string[]): boolean {
    return acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
            const category = type.slice(0, -2);
            return file.type.startsWith(category);
        }
        return file.type === type || file.name.endsWith(type);
    });
}
