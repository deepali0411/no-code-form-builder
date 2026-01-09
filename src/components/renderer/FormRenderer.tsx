/**
 * Form Renderer
 * Renders a form from schema in preview/runtime mode
 */

import { useState } from 'react';
import { useFormBuilderStore } from '../../store';
import { validateForm, evaluateConditions } from '../../validation';
import type { FormData, FieldSchema } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export function FormRenderer() {
    const { currentForm } = useFormBuilderStore();
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFieldChange = (fieldId: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
        // Clear error for this field
        if (errors[fieldId]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationResult = validateForm(currentForm.fields, formData);

        if (validationResult.valid) {
            console.log('Form submitted successfully!', formData);
            alert(currentForm.settings.successMessage);
            // Reset form
            setFormData({});
            setErrors({});
        } else {
            setErrors(validationResult.errors);
            console.log('Validation errors:', validationResult.errors);
        }
    };

    // Filter visible fields based on conditions
    const visibleFields = currentForm.fields.filter((field) => {
        // Skip section fields from visibility check
        if (field.type === 'section') return true;

        // Check conditional visibility
        if (field.conditions) {
            return evaluateConditions(field, formData, currentForm.fields);
        }

        return true;
    });

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Form Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentForm.metadata.title}
                    </h1>
                    {currentForm.metadata.description && (
                        <p className="text-gray-600">{currentForm.metadata.description}</p>
                    )}
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {visibleFields.map((field) => (
                        <FieldRenderer
                            key={field.id}
                            field={field}
                            value={formData[field.id]}
                            error={errors[field.id]}
                            onChange={(value) => handleFieldChange(field.id, value)}
                        />
                    ))}

                    {/* Submit Button */}
                    {currentForm.settings.submitButton.enabled && (
                        <div className="pt-4">
                            <Button type="submit" variant="primary" size="lg" className="w-full">
                                {currentForm.settings.submitButton.text}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

/**
 * Field Renderer - renders individual fields based on type
 */
interface FieldRendererProps {
    field: FieldSchema;
    value: unknown;
    error?: string;
    onChange: (value: unknown) => void;
}

function FieldRenderer({ field, value, error, onChange }: FieldRendererProps) {
    const config = field.config;
    const required = 'required' in config ? config.required : false;
    const placeholder = 'placeholder' in config ? config.placeholder : undefined;
    const helpText = 'helpText' in config ? config.helpText : undefined;

    // Section/Divider
    if (field.type === 'section') {
        const sectionConfig = config as { heading?: string; description?: string; divider?: boolean };
        return (
            <div className="py-4">
                {sectionConfig.divider && <hr className="border-gray-200 mb-4" />}
                {sectionConfig.heading && (
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {sectionConfig.heading}
                    </h2>
                )}
                {sectionConfig.description && (
                    <p className="text-gray-600 text-sm">{sectionConfig.description}</p>
                )}
            </div>
        );
    }

    // Text, Email, Password
    if (field.type === 'text' || field.type === 'email' || field.type === 'password') {
        return (
            <Input
                type={field.type}
                label={field.label}
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                error={error}
                helpText={helpText}
                disabled={'disabled' in config ? config.disabled : false}
                readOnly={'readonly' in config ? config.readonly : false}
            />
        );
    }

    // Number
    if (field.type === 'number') {
        const numberConfig = config as { min?: number; max?: number; step?: number };
        return (
            <Input
                type="number"
                label={field.label}
                value={(value as number) || ''}
                onChange={(e) => onChange(Number(e.target.value))}
                placeholder={placeholder}
                required={required}
                error={error}
                helpText={helpText}
                min={numberConfig.min}
                max={numberConfig.max}
                step={numberConfig.step}
            />
        );
    }

    // Textarea
    if (field.type === 'textarea') {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    // Select
    if (field.type === 'select') {
        const selectConfig = config as { options: Array<{ label: string; value: string }> };
        return (
            <Select
                label={field.label}
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                options={[
                    { label: placeholder || 'Select an option...', value: '' },
                    ...selectConfig.options,
                ]}
                required={required}
                error={error}
                helpText={helpText}
            />
        );
    }

    // Radio
    if (field.type === 'radio') {
        const radioConfig = config as { options: Array<{ label: string; value: string }>; inline?: boolean };
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className={radioConfig.inline ? 'flex gap-4' : 'space-y-2'}>
                    {radioConfig.options.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name={field.id}
                                value={option.value}
                                checked={value === option.value}
                                onChange={(e) => onChange(e.target.value)}
                                required={required}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                    ))}
                </div>
                {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    // Checkbox
    if (field.type === 'checkbox') {
        const checkboxConfig = config as { options: Array<{ label: string; value: string }>; inline?: boolean };
        const selectedValues = (value as string[]) || [];

        const handleCheckboxChange = (optionValue: string, checked: boolean) => {
            if (checked) {
                onChange([...selectedValues, optionValue]);
            } else {
                onChange(selectedValues.filter((v) => v !== optionValue));
            }
        };

        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className={checkboxConfig.inline ? 'flex gap-4' : 'space-y-2'}>
                    {checkboxConfig.options.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value={option.value}
                                checked={selectedValues.includes(option.value)}
                                onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                    ))}
                </div>
                {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    // Date
    if (field.type === 'date') {
        return (
            <Input
                type="date"
                label={field.label}
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                error={error}
                helpText={helpText}
            />
        );
    }

    // Switch/Toggle
    if (field.type === 'switch') {
        return (
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id={field.id}
                    checked={(value as boolean) || false}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-11 h-6 bg-gray-200 rounded-full peer appearance-none cursor-pointer checked:bg-primary-600 transition-colors relative
                     after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform
                     checked:after:translate-x-5"
                />
                <label htmlFor={field.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                    {field.label}
                </label>
            </div>
        );
    }

    // Range
    if (field.type === 'range') {
        const rangeConfig = config as { min: number; max: number; step?: number; showValue?: boolean };
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">
                        {field.label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {rangeConfig.showValue && (
                        <span className="text-sm font-medium text-primary-600">
                            {(value as number) || rangeConfig.min}
                        </span>
                    )}
                </div>
                <input
                    type="range"
                    min={rangeConfig.min}
                    max={rangeConfig.max}
                    step={rangeConfig.step || 1}
                    value={(value as number) || rangeConfig.min}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{rangeConfig.min}</span>
                    <span>{rangeConfig.max}</span>
                </div>
                {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
            </div>
        );
    }

    // Rating
    if (field.type === 'rating') {
        const ratingConfig = config as { maxRating?: number };
        const maxRating = ratingConfig.maxRating || 5;
        const currentRating = (value as number) || 0;

        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex gap-1">
                    {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                        <button
                            key={rating}
                            type="button"
                            onClick={() => onChange(rating)}
                            className="text-3xl transition-colors focus:outline-none"
                        >
                            {rating <= currentRating ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>
                {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
            </div>
        );
    }

    // File upload
    if (field.type === 'file') {
        const fileConfig = config as { accept?: string; multiple?: boolean };
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                    type="file"
                    accept={fileConfig.accept}
                    multiple={fileConfig.multiple}
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                            onChange(fileConfig.multiple ? Array.from(files) : files[0]);
                        }
                    }}
                    required={required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                     file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700
                     hover:file:bg-primary-100 cursor-pointer"
                />
                {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    // Fallback for unsupported field types
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
                Field type "{field.type}" not yet implemented in renderer
            </p>
        </div>
    );
}
