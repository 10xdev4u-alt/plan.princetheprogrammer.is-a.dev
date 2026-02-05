'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Milestone } from '@/types/database';

interface KanbanColumnProps {
  id: string; // The status (e.g., 'pending', 'in_progress')
  title: string;
  milestones: Milestone[];
  children: React.ReactNode; // Draggable milestones will be children
}

export function KanbanColumn({ id, title, milestones, children }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="w-80 flex-shrink-0">
      <h3 className="text-lg font-bold mb-4 text-slate-300">{title} ({milestones.length})</h3>
      <div
        ref={setNodeRef}
        className="bg-slate-800/50 p-4 rounded-lg min-h-[200px] border border-slate-700 space-y-3"
      >
        <SortableContext id={id} items={milestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}
