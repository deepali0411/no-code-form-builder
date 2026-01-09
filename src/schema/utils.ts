/**
 * Schema utilities for creating, validating, and migrating form schemas
 */

import { v4 as uuidv4 } from 'uuid';
import type { FormSchema, FieldSchema, FieldType, FormMetadata, FormSettings } from '../types';
import { SCHEMA_VERSION, DEFAULT_FORM_TITLE, DEFAULT_SUBMIT_BUTTON_TEXT, DEFAULT_SUCCESS_MESSAGE } from '../constants';
import { getFieldDefinition } from './fieldRegistry';

/**
 * Create a new empty form schema
 */
export function createEmptyFormSchema(): FormSchema {
    const now = new Date().toISOString();

    return {
        version: SCHEMA_VERSION,
        id: uuidv4(),
        metadata: {
            title: DEFAULT_FORM_TITLE,
            description: '',
            createdAt: now,
            updatedAt: now,
        },
        fields: [],
        settings: {
            submitButton: {
                text: DEFAULT_SUBMIT_BUTTON_TEXT,
                enabled: true,
            },
            successMessage: DEFAULT_SUCCESS_MESSAGE,
        },
    };
}

/**
 * Create a new field schema from a field type
 */
export function createFieldSchema(type: FieldType, order: number): FieldSchema {
    const definition = getFieldDefinition(type);

    return {
        id: uuidv4(),
        type,
        label: definition.label,
        config: { ...definition.defaultConfig },
        order,
    };
}

/**
 * Update form metadata timestamp
 */
export function updateFormTimestamp(schema: FormSchema): FormSchema {
    return {
        ...schema,
        metadata: {
            ...schema.metadata,
            updatedAt: new Date().toISOString(),
        },
    };
}

/**
 * Validate form schema structure
 * Returns true if valid, throws error if invalid
 */
export function validateFormSchema(schema: unknown): schema is FormSchema {
    if (!schema || typeof schema !== 'object') {
        throw new Error('Schema must be an object');
    }

    const s = schema as FormSchema;

    if (!s.version || typeof s.version !== 'string') {
        throw new Error('Schema must have a version string');
    }

    if (!s.id || typeof s.id !== 'string') {
        throw new Error('Schema must have an id string');
    }

    if (!s.metadata || typeof s.metadata !== 'object') {
        throw new Error('Schema must have metadata object');
    }

    if (!Array.isArray(s.fields)) {
        throw new Error('Schema must have fields array');
    }

    if (!s.settings || typeof s.settings !== 'object') {
        throw new Error('Schema must have settings object');
    }

    return true;
}

/**
 * Migrate schema from old version to current version
 * This function should be updated as schema versions change
 */
export function migrateSchema(schema: FormSchema): FormSchema {
    let migrated = { ...schema };

    // Migration from 1.0.0 to 1.1.0 (example for future)
    // if (migrated.version === '1.0.0') {
    //   migrated = migrateFrom1_0_0To1_1_0(migrated);
    // }

    // Ensure version is current
    migrated.version = SCHEMA_VERSION;

    return migrated;
}

/**
 * Clone a field with a new ID
 */
export function cloneField(field: FieldSchema, newOrder: number): FieldSchema {
    return {
        ...field,
        id: uuidv4(),
        order: newOrder,
        label: `${field.label} (Copy)`,
    };
}

/**
 * Remove field and cleanup dependencies
 * Returns updated fields array with dependencies cleaned up
 */
export function removeFieldWithCleanup(fields: FieldSchema[], fieldId: string): FieldSchema[] {
    // Remove the field
    const updatedFields = fields.filter((f) => f.id !== fieldId);

    // Clean up conditional rules that reference the removed field
    return updatedFields.map((field) => {
        if (field.conditions?.rules) {
            const cleanedRules = field.conditions.rules.filter((rule) => rule.field !== fieldId);

            // If no rules left, remove conditions entirely
            if (cleanedRules.length === 0) {
                const { conditions, ...rest } = field;
                return rest as FieldSchema;
            }

            return {
                ...field,
                conditions: {
                    ...field.conditions,
                    rules: cleanedRules,
                },
            };
        }
        return field;
    });
}

/**
 * Detect circular dependencies in conditional rules
 * Returns array of field IDs that form a circular dependency
 */
export function detectCircularDependencies(fields: FieldSchema[]): string[] {
    const dependencies = new Map<string, Set<string>>();

    // Build dependency graph
    fields.forEach((field) => {
        const deps = new Set<string>();
        field.conditions?.rules.forEach((rule) => {
            deps.add(rule.field);
        });
        dependencies.set(field.id, deps);
    });

    // Detect cycles using depth-first search
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];

    function hasCycle(fieldId: string): boolean {
        if (recursionStack.has(fieldId)) {
            cycles.push(fieldId);
            return true;
        }

        if (visited.has(fieldId)) {
            return false;
        }

        visited.add(fieldId);
        recursionStack.add(fieldId);

        const deps = dependencies.get(fieldId);
        if (deps) {
            for (const dep of deps) {
                if (hasCycle(dep)) {
                    return true;
                }
            }
        }

        recursionStack.delete(fieldId);
        return false;
    }

    fields.forEach((field) => {
        if (!visited.has(field.id)) {
            hasCycle(field.id);
        }
    });

    return cycles;
}

/**
 * Reorder fields array
 */
export function reorderFields(fields: FieldSchema[], fromIndex: number, toIndex: number): FieldSchema[] {
    const result = Array.from(fields);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);

    // Update order property
    return result.map((field, index) => ({
        ...field,
        order: index,
    }));
}
