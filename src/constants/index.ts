/**
 * Constants used throughout the application
 */

export const SCHEMA_VERSION = '1.0.0';

export const DEFAULT_FORM_TITLE = 'Untitled Form';

export const DEFAULT_SUBMIT_BUTTON_TEXT = 'Submit';

export const DEFAULT_SUCCESS_MESSAGE = 'Thank you! Your form has been submitted successfully.';

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
    FORMS: 'form-builder:forms',
    CURRENT_FORM: 'form-builder:current',
    FORM_PREFIX: 'form-builder:form:',
} as const;

/**
 * Validation error messages
 */
export const ERROR_MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_URL: 'Please enter a valid URL',
    MIN_LENGTH: (min: number) => `Minimum length is ${min} characters`,
    MAX_LENGTH: (max: number) => `Maximum length is ${max} characters`,
    MIN_VALUE: (min: number) => `Minimum value is ${min}`,
    MAX_VALUE: (max: number) => `Maximum value is ${max}`,
    PATTERN_MISMATCH: 'Invalid format',
    FILE_TOO_LARGE: (maxSize: number) => `File size must be less than ${maxSize}MB`,
    INVALID_FILE_TYPE: 'Invalid file type',
    MIN_SELECTIONS: (min: number) => `Please select at least ${min} option(s)`,
    MAX_SELECTIONS: (max: number) => `Please select at most ${max} option(s)`,
} as const;

/**
 * DnD Kit identifiers
 */
export const DND_TYPES = {
    PALETTE_FIELD: 'palette-field',
    CANVAS_FIELD: 'canvas-field',
    CANVAS: 'canvas',
} as const;

/**
 * Field configuration panel sections
 */
export const CONFIG_SECTIONS = {
    BASIC: 'basic',
    VALIDATION: 'validation',
    CONDITIONS: 'conditions',
    ADVANCED: 'advanced',
} as const;
