/**
 * Config Panel
 * Right sidebar for configuring selected field
 */

import { useFormBuilderStore } from '../../store';
import { BasicConfig } from './BasicConfig';

export function ConfigPanel() {
    const { selectedFieldId, currentForm } = useFormBuilderStore();

    const selectedField = currentForm.fields.find((f) => f.id === selectedFieldId);

    if (!selectedField) {
        return (
            <div className="p-6 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-3">⚙️</div>
                    <p className="text-gray-600 text-sm">
                        Select a field to configure its properties
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Field Configuration</h2>
            <BasicConfig field={selectedField} />
            {/* TODO: Add ValidationConfig, ConditionsConfig, AdvancedConfig */}
        </div>
    );
}
