/**
 * LocalStorage persistence adapter
 * Handles saving and loading forms from browser localStorage
 */

import type { FormSchema, PersistenceAdapter, SavedForm } from '../types';
import { STORAGE_KEYS } from '../constants';
import { validateFormSchema, migrateSchema } from '../schema/utils';

/**
 * LocalStorage implementation of persistence adapter
 */
export const localStorageAdapter: PersistenceAdapter = {
    /**
     * Save a form to localStorage
     */
    async save(form: FormSchema): Promise<void> {
        try {
            const key = `${STORAGE_KEYS.FORM_PREFIX}${form.id}`;
            localStorage.setItem(key, JSON.stringify(form));

            // Update forms index
            const forms = await this.list();
            const existingIndex = forms.findIndex((f) => f.id === form.id);

            const savedForm: SavedForm = {
                id: form.id,
                schema: form,
                savedAt: new Date().toISOString(),
            };

            let updatedForms: SavedForm[];
            if (existingIndex >= 0) {
                updatedForms = [...forms];
                updatedForms[existingIndex] = savedForm;
            } else {
                updatedForms = [...forms, savedForm];
            }

            localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(updatedForms));
        } catch (error) {
            console.error('Failed to save form:', error);
            throw new Error('Failed to save form to localStorage');
        }
    },

    /**
     * Load a form from localStorage
     */
    async load(id: string): Promise<FormSchema | null> {
        try {
            const key = `${STORAGE_KEYS.FORM_PREFIX}${id}`;
            const data = localStorage.getItem(key);

            if (!data) {
                return null;
            }

            const schema = JSON.parse(data);

            // Validate schema structure
            validateFormSchema(schema);

            // Migrate if necessary
            const migrated = migrateSchema(schema);

            return migrated;
        } catch (error) {
            console.error('Failed to load form:', error);
            // Return null for corrupted data
            return null;
        }
    },

    /**
     * List all saved forms
     */
    async list(): Promise<SavedForm[]> {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FORMS);

            if (!data) {
                return [];
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to list forms:', error);
            return [];
        }
    },

    /**
     * Delete a form from localStorage
     */
    async delete(id: string): Promise<void> {
        try {
            const key = `${STORAGE_KEYS.FORM_PREFIX}${id}`;
            localStorage.removeItem(key);

            // Update forms index
            const forms = await this.list();
            const updatedForms = forms.filter((f) => f.id !== id);
            localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(updatedForms));
        } catch (error) {
            console.error('Failed to delete form:', error);
            throw new Error('Failed to delete form from localStorage');
        }
    },
};

/**
 * Save current form state
 */
export async function saveCurrentForm(schema: FormSchema): Promise<void> {
    await localStorageAdapter.save(schema);
    localStorage.setItem(STORAGE_KEYS.CURRENT_FORM, schema.id);
}

/**
 * Load the most recently edited form
 */
export async function loadCurrentForm(): Promise<FormSchema | null> {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_FORM);

    if (!currentId) {
        return null;
    }

    return localStorageAdapter.load(currentId);
}

/**
 * Clear all forms from storage (for testing/debugging)
 */
export function clearAllForms(): void {
    const forms = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]') as SavedForm[];

    forms.forEach((form) => {
        localStorage.removeItem(`${STORAGE_KEYS.FORM_PREFIX}${form.id}`);
    });

    localStorage.removeItem(STORAGE_KEYS.FORMS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_FORM);
}
