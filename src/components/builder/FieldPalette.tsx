/**
 * Field Palette
 * Draggable list of available field types
 */

import { useDraggable } from '@dnd-kit/core';
import { FIELD_REGISTRY } from '../../schema/fieldRegistry';
import type { FieldType, FieldCategory } from '../../types';

export function FieldPalette() {
    const categories: FieldCategory[] = ['input', 'choice', 'layout', 'special'];

    const categoryLabels: Record<FieldCategory, string> = {
        input: '📝 Input Fields',
        choice: '☑️ Choice Fields',
        layout: '📏 Layout',
        special: '⚙️ Special',
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Add Fields</h2>
            {categories.map((category) => {
                const fields = Object.values(FIELD_REGISTRY).filter((f) => f.category === category);

                if (fields.length === 0) return null;

                return (
                    <div key={category} className="mb-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            {categoryLabels[category]}
                        </h3>
                        <div className="space-y-2">
                            {fields.map((field) => (
                                <DraggableFieldItem key={field.type} fieldType={field.type} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface DraggableFieldItemProps {
    fieldType: FieldType;
}

function DraggableFieldItem({ fieldType }: DraggableFieldItemProps) {
    const field = FIELD_REGISTRY[fieldType];

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${fieldType}`,
        data: {
            fieldType,
            source: 'palette',
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`
        flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg
        cursor-grab active:cursor-grabbing hover:border-primary-400 hover:shadow-sm
        transition-all
        ${isDragging ? 'opacity-50' : ''}
      `}
        >
            <span className="text-2xl">{field.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{field.label}</p>
                <p className="text-xs text-gray-500 truncate">{field.description}</p>
            </div>
        </div>
    );
}
