/**
 * Main Form Builder component
 * Three-column layout: Field Palette | Canvas | Config Panel
 */

import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import { FieldPalette } from './FieldPalette';
import { BuilderCanvas } from './BuilderCanvas';
import { ConfigPanel } from '../config/ConfigPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { useFormBuilderStore } from '../../store';
import type { FieldType } from '../../types';

export function FormBuilder() {
    const { currentForm, addField, reorderField } = useFormBuilderStore();
    const [_activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<FieldType | null>(null);

    // Configure sensors for better drag experience
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
        const fieldType = event.active.data.current?.fieldType;
        if (fieldType) {
            setActiveType(fieldType);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveType(null);
            return;
        }

        // Check if dragging from palette (new field)
        const source = active.data.current?.source;
        if (source === 'palette') {
            const fieldType = active.data.current?.fieldType as FieldType;
            if (fieldType) {
                addField(fieldType);
            }
        } else {
            // Reordering existing field
            if (active.id !== over.id) {
                const oldIndex = currentForm.fields.findIndex((f) => f.id === active.id);
                const newIndex = currentForm.fields.findIndex((f) => f.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    reorderField(oldIndex, newIndex);
                }
            }
        }

        setActiveId(null);
        setActiveType(null);
    }

    function handleDragCancel() {
        setActiveId(null);
        setActiveType(null);
    }

    return (
        <div className="h-full flex flex-col">
            <BuilderToolbar />

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="flex-1 grid grid-cols-[280px_1fr_320px] overflow-hidden">
                    {/* Left: Field Palette */}
                    <aside className="bg-white border-r border-gray-200 overflow-y-auto">
                        <FieldPalette />
                    </aside>

                    {/* Center: Canvas */}
                    <main className="bg-gray-50 overflow-y-auto">
                        <BuilderCanvas />
                    </main>

                    {/* Right: Config Panel */}
                    <aside className="bg-white border-l border-gray-200 overflow-y-auto">
                        <ConfigPanel />
                    </aside>
                </div>

                <DragOverlay>
                    {activeType && (
                        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary-400">
                            <p className="font-medium">{activeType}</p>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
