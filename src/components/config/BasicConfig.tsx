/**
 * Basic Config Section
 * Label, placeholder, required, help text
 */

import { useFormBuilderStore } from '../../store';
import { Input } from '../ui/Input';
import type { FieldSchema } from '../../types';

interface BasicConfigProps {
    field: FieldSchema;
}

export function BasicConfig({ field }: BasicConfigProps) {
    const { updateField } = useFormBuilderStore();

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateField(field.id, { label: e.target.value });
    };

    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if ('placeholder' in field.config) {
            updateField(field.id, {
                config: { ...field.config, placeholder: e.target.value },
            });
        }
    };

    const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if ('required' in field.config) {
            updateField(field.id, {
                config: { ...field.config, required: e.target.checked },
            });
        }
    };

    const handleHelpTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if ('helpText' in field.config) {
            updateField(field.id, {
                config: { ...field.config, helpText: e.target.value },
            });
        }
    };

    const hasPlaceholder = 'placeholder' in field.config;
    const hasRequired = 'required' in field.config;
    const hasHelpText = 'helpText' in field.config;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Basic Settings</h3>

            <Input
                label="Label"
                value={field.label}
                onChange={handleLabelChange}
                placeholder="Field label"
            />

            {hasPlaceholder && (
                <Input
                    label="Placeholder"
                    value={(field.config as { placeholder?: string }).placeholder || ''}
                    onChange={handlePlaceholderChange}
                    placeholder="Placeholder text"
                />
            )}

            {hasHelpText && (
                <Input
                    label="Help Text"
                    value={(field.config as { helpText?: string }).helpText || ''}
                    onChange={handleHelpTextChange}
                    placeholder="Additional help text"
                />
            )}

            {hasRequired && (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="required"
                        checked={(field.config as { required?: boolean }).required || false}
                        onChange={handleRequiredChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700">
                        Required field
                    </label>
                </div>
            )}
        </div>
    );
}
