'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Milestone } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card'; // Using shadcn Card for consistency

interface DraggableMilestoneCardProps {
  milestone: Milestone;
}

export function DraggableMilestoneCard({ milestone }: DraggableMilestoneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: milestone.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-slate-700 hover:bg-slate-600 border border-slate-600 p-3 rounded-md text-sm cursor-grab active:cursor-grabbing shadow-md mb-2"
    >
      <CardContent className="p-0">
        <h4 className="font-semibold text-white">{milestone.title}</h4>
        {/* Add more milestone details later if needed */}
      </CardContent>
    </Card>
  );
}
