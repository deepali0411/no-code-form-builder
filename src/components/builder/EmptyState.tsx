/**
 * Empty State
 * Shown when canvas has no fields
 */

export function EmptyState() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Start Building Your Form
                </h3>
                <p className="text-gray-600 mb-4">
                    Drag and drop fields from the left panel to create your form. You can reorder, configure, and customize each field.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <p className="text-sm font-medium text-blue-900 mb-2">💡 Quick Tips:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Drag fields to add them to your form</li>
                        <li>• Click a field to configure its properties</li>
                        <li>• Use the preview mode to test your form</li>
                        <li>• Don't forget to save your work!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
