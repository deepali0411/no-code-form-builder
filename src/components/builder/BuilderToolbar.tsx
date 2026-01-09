/**
 * Builder Toolbar
 * Top toolbar with mode toggle and actions
 */

import { useFormBuilderStore } from '../../store';
import { Button } from '../ui/Button';
import { saveCurrentForm } from '../../utils/persistence';

export function BuilderToolbar() {
    const { mode, setMode, currentForm, newForm } = useFormBuilderStore();

    const handleSave = async () => {
        try {
            await saveCurrentForm(currentForm);
            // TODO: Show success toast
            console.log('Form saved successfully');
        } catch (error) {
            console.error('Failed to save form:', error);
            // TODO: Show error toast
        }
    };

    const handleNewForm = () => {
        if (confirm('Create a new form? Any unsaved changes will be lost.')) {
            newForm();
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setMode('builder')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'builder'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        ✏️ Builder
                    </button>
                    <button
                        onClick={() => setMode('preview')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'preview'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        👁️ Preview
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleNewForm}>
                    ➕ New Form
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                    💾 Save
                </Button>
            </div>
        </div>
    );
}
