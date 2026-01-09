/**
 * Field registry - central definition of all field types
 * This pattern allows easy extension of new field types
 */

import type { FieldDefinition, FieldType } from '../types';

/**
 * Registry of all available field types with their metadata
 * Each field type is defined once here and referenced throughout the application
 */
export const FIELD_REGISTRY: Record<FieldType, FieldDefinition> = {
    text: {
        type: 'text',
        category: 'input',
        icon: '📝',
        label: 'Text Input',
        description: 'Single line text input',
        defaultConfig: {
            placeholder: 'Enter text...',
            required: false,
            defaultValue: '',
        },
    },
    email: {
        type: 'email',
        category: 'input',
        icon: '📧',
        label: 'Email',
        description: 'Email address input with validation',
        defaultConfig: {
            placeholder: 'email@example.com',
            required: false,
            defaultValue: '',
            validation: [
                {
                    type: 'email',
                    message: 'Please enter a valid email address',
                },
            ],
        },
    },
    password: {
        type: 'password',
        category: 'input',
        icon: '🔒',
        label: 'Password',
        description: 'Password input field',
        defaultConfig: {
            placeholder: 'Enter password...',
            required: false,
            defaultValue: '',
        },
    },
    number: {
        type: 'number',
        category: 'input',
        icon: '🔢',
        label: 'Number',
        description: 'Numeric input with min/max validation',
        defaultConfig: {
            placeholder: 'Enter number...',
            required: false,
            defaultValue: '',
        },
    },
    textarea: {
        type: 'textarea',
        category: 'input',
        icon: '📄',
        label: 'Textarea',
        description: 'Multi-line text input',
        defaultConfig: {
            placeholder: 'Enter text...',
            required: false,
            defaultValue: '',
        },
    },
    select: {
        type: 'select',
        category: 'choice',
        icon: '📋',
        label: 'Dropdown',
        description: 'Select from a list of options',
        defaultConfig: {
            placeholder: 'Select an option...',
            required: false,
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
                { label: 'Option 3', value: 'option3' },
            ],
        },
    },
    radio: {
        type: 'radio',
        category: 'choice',
        icon: '🔘',
        label: 'Radio Group',
        description: 'Choose one option from a list',
        defaultConfig: {
            required: false,
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
                { label: 'Option 3', value: 'option3' },
            ],
            inline: false,
        },
    },
    checkbox: {
        type: 'checkbox',
        category: 'choice',
        icon: '☑️',
        label: 'Checkbox Group',
        description: 'Choose multiple options',
        defaultConfig: {
            required: false,
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
                { label: 'Option 3', value: 'option3' },
            ],
            inline: false,
        },
    },
    date: {
        type: 'date',
        category: 'input',
        icon: '📅',
        label: 'Date Picker',
        description: 'Select a date',
        defaultConfig: {
            required: false,
            defaultValue: '',
        },
    },
    file: {
        type: 'file',
        category: 'input',
        icon: '📎',
        label: 'File Upload',
        description: 'Upload one or more files',
        defaultConfig: {
            required: false,
            multiple: false,
            maxSize: 5 * 1024 * 1024, // 5MB
        },
    },
    switch: {
        type: 'switch',
        category: 'input',
        icon: '🔄',
        label: 'Switch/Toggle',
        description: 'On/off toggle switch',
        defaultConfig: {
            required: false,
            defaultValue: false,
        },
    },
    rating: {
        type: 'rating',
        category: 'input',
        icon: '⭐',
        label: 'Rating',
        description: 'Star rating input',
        defaultConfig: {
            required: false,
            maxRating: 5,
            icon: 'star',
        },
    },
    range: {
        type: 'range',
        category: 'input',
        icon: '📊',
        label: 'Range Slider',
        description: 'Select a value from a range',
        defaultConfig: {
            required: false,
            min: 0,
            max: 100,
            step: 1,
            showValue: true,
        },
    },
    hidden: {
        type: 'hidden',
        category: 'special',
        icon: '👁️',
        label: 'Hidden Field',
        description: 'Hidden input for tracking data',
        defaultConfig: {
            defaultValue: '',
        },
    },
    section: {
        type: 'section',
        category: 'layout',
        icon: '📏',
        label: 'Section',
        description: 'Visual divider with optional heading',
        defaultConfig: {
            heading: 'Section Heading',
            description: '',
            divider: true,
        },
    },
    conditional: {
        type: 'conditional',
        category: 'special',
        icon: '🔀',
        label: 'Conditional Field',
        description: 'Field with visibility conditions',
        defaultConfig: {
            required: false,
        },
    },
};

/**
 * Get field definition by type
 */
export function getFieldDefinition(type: FieldType): FieldDefinition {
    return FIELD_REGISTRY[type];
}

/**
 * Get all field types in a category
 */
export function getFieldsByCategory(category: string): FieldDefinition[] {
    return Object.values(FIELD_REGISTRY).filter((field) => field.category === category);
}

/**
 * Get all field categories
 */
export function getAllCategories(): string[] {
    const categories = new Set(Object.values(FIELD_REGISTRY).map((field) => field.category));
    return Array.from(categories);
}
