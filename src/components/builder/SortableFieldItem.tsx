/**
 * Sortable Field Item
 * Draggable and sortable field in the canvas
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormBuilderStore } from '../../store';
import { FIELD_REGISTRY } from '../../schema/fieldRegistry';
import type { FieldSchema } from '../../types';

interface SortableFieldItemProps {
    field: FieldSchema;
}

export function SortableFieldItem({ field }: SortableFieldItemProps) {
    const { selectedFieldId, selectField, removeField, duplicateField } = useFormBuilderStore();
    const fieldDef = FIELD_REGISTRY[field.type];

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: field.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isSelected = selectedFieldId === field.id;

    const handleClick = () => {
        selectField(field.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this field?')) {
            removeField(field.id);
        }
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        duplicateField(field.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            className={`
        group relative p-4 border-2 rounded-lg cursor-pointer transition-all
        ${isDragging ? 'opacity-50' : ''}
        ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'}
      `}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
            </div>

            {/* Field Content */}
            <div className="ml-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{fieldDef.icon}</span>
                            <span className="text-xs font-medium text-gray-500 uppercase">{field.type}</span>
                        </div>
                        <p className="font-medium text-gray-900">{field.label}</p>
                        {field.config && 'placeholder' in field.config && field.config.placeholder && (
                            <p className="text-sm text-gray-500 mt-1">{field.config.placeholder}</p>
                        )}
                        {field.config && 'required' in field.config && field.config.required && (
                            <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                Required
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={handleDuplicate}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Duplicate"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
