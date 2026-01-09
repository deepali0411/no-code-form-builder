/**
 * Builder Canvas
 * Droppable area where fields are placed and arranged
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormBuilderStore } from '../../store';
import { SortableFieldItem } from './SortableFieldItem';
import { EmptyState } from './EmptyState';
import { FormRenderer } from '../renderer/FormRenderer';

export function BuilderCanvas() {
    const { currentForm, mode } = useFormBuilderStore();
    const { fields } = currentForm;

    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    if (mode === 'preview') {
        // Preview mode - render the actual form
        return <FormRenderer />;
    }

    // Builder mode
    if (fields.length === 0) {
        return (
            <div ref={setNodeRef} className="h-full">
                <EmptyState />
            </div>
        );
    }

    const fieldIds = fields.map((f) => f.id);

    return (
        <div ref={setNodeRef} className="max-w-3xl mx-auto p-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {fields.map((field) => (
                            <SortableFieldItem key={field.id} field={field} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
