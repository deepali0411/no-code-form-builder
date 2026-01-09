/**
 * Zustand store for form builder state management
 * Single source of truth for the entire application
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FormSchema, FieldSchema, FieldType, BuilderMode, FormData, FieldValue } from '../types';
import { createEmptyFormSchema, createFieldSchema, updateFormTimestamp, cloneField, removeFieldWithCleanup, reorderFields } from '../schema/utils';

interface FormBuilderState {
    // Current form being edited
    currentForm: FormSchema;

    // Form data (runtime values)
    formData: FormData;

    // UI state
    mode: BuilderMode;
    selectedFieldId: string | null;

    // Actions
    setMode: (mode: BuilderMode) => void;
    selectField: (fieldId: string | null) => void;

    // Form actions
    newForm: () => void;
    loadForm: (schema: FormSchema) => void;
    updateFormMetadata: (metadata: Partial<FormSchema['metadata']>) => void;
    updateFormSettings: (settings: Partial<FormSchema['settings']>) => void;

    // Field actions
    addField: (type: FieldType, position?: number) => void;
    updateField: (fieldId: string, updates: Partial<FieldSchema>) => void;
    removeField: (fieldId: string) => void;
    duplicateField: (fieldId: string) => void;
    reorderField: (fromIndex: number, toIndex: number) => void;

    // Form data actions
    setFieldValue: (fieldId: string, value: FieldValue) => void;
    resetFormData: () => void;
}

/**
 * Create the form builder store
 */
export const useFormBuilderStore = create<FormBuilderState>()(
    devtools(
        (set) => ({
            // Initial state
            currentForm: createEmptyFormSchema(),
            formData: {},
            mode: 'builder',
            selectedFieldId: null,

            // UI actions
            setMode: (mode) => set({ mode }),

            selectField: (fieldId) => set({ selectedFieldId: fieldId }),

            // Form actions
            newForm: () =>
                set({
                    currentForm: createEmptyFormSchema(),
                    formData: {},
                    selectedFieldId: null,
                }),

            loadForm: (schema) =>
                set({
                    currentForm: schema,
                    formData: {},
                    selectedFieldId: null,
                }),

            updateFormMetadata: (metadata) =>
                set((state) => ({
                    currentForm: updateFormTimestamp({
                        ...state.currentForm,
                        metadata: {
                            ...state.currentForm.metadata,
                            ...metadata,
                        },
                    }),
                })),

            updateFormSettings: (settings) =>
                set((state) => ({
                    currentForm: updateFormTimestamp({
                        ...state.currentForm,
                        settings: {
                            ...state.currentForm.settings,
                            ...settings,
                        },
                    }),
                })),

            // Field actions
            addField: (type, position) =>
                set((state) => {
                    const { currentForm } = state;
                    const insertPosition = position ?? currentForm.fields.length;
                    const newField = createFieldSchema(type, insertPosition);

                    const updatedFields = [...currentForm.fields];
                    updatedFields.splice(insertPosition, 0, newField);

                    // Update order for all fields after insertion point
                    const reorderedFields = updatedFields.map((field, index) => ({
                        ...field,
                        order: index,
                    }));

                    return {
                        currentForm: updateFormTimestamp({
                            ...currentForm,
                            fields: reorderedFields,
                        }),
                        selectedFieldId: newField.id,
                    };
                }),

            updateField: (fieldId, updates) =>
                set((state) => {
                    const { currentForm } = state;
                    const updatedFields = currentForm.fields.map((field) =>
                        field.id === fieldId ? { ...field, ...updates } : field
                    );

                    return {
                        currentForm: updateFormTimestamp({
                            ...currentForm,
                            fields: updatedFields,
                        }),
                    };
                }),

            removeField: (fieldId) =>
                set((state) => {
                    const { currentForm, selectedFieldId } = state;
                    const updatedFields = removeFieldWithCleanup(currentForm.fields, fieldId);

                    return {
                        currentForm: updateFormTimestamp({
                            ...currentForm,
                            fields: updatedFields,
                        }),
                        selectedFieldId: selectedFieldId === fieldId ? null : selectedFieldId,
                    };
                }),

            duplicateField: (fieldId) =>
                set((state) => {
                    const { currentForm } = state;
                    const fieldIndex = currentForm.fields.findIndex((f) => f.id === fieldId);

                    if (fieldIndex === -1) return state;

                    const field = currentForm.fields[fieldIndex];
                    const newField = cloneField(field, fieldIndex + 1);

                    const updatedFields = [...currentForm.fields];
                    updatedFields.splice(fieldIndex + 1, 0, newField);

                    // Update order for all fields after insertion
                    const reorderedFields = updatedFields.map((f, index) => ({
                        ...f,
                        order: index,
                    }));

                    return {
                        currentForm: updateFormTimestamp({
                            ...currentForm,
                            fields: reorderedFields,
                        }),
                        selectedFieldId: newField.id,
                    };
                }),

            reorderField: (fromIndex, toIndex) =>
                set((state) => {
                    const { currentForm } = state;
                    const reorderedFields = reorderFields(currentForm.fields, fromIndex, toIndex);

                    return {
                        currentForm: updateFormTimestamp({
                            ...currentForm,
                            fields: reorderedFields,
                        }),
                    };
                }),

            // Form data actions
            setFieldValue: (fieldId, value) =>
                set((state) => ({
                    formData: {
                        ...state.formData,
                        [fieldId]: value,
                    },
                })),

            resetFormData: () => set({ formData: {} }),
        }),
        { name: 'FormBuilder' }
    )
);
