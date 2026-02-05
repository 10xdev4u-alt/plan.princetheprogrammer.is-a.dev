'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DndContext, DragOverlay, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable'; // Will use these later for sorting
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Milestone } from '@/types/database';
import { toast } from 'sonner';

interface IdeaRoadmapPageProps {
  params: {
    id: string;
  };
}

export default function IdeaRoadmapPage({ params }: IdeaRoadmapPageProps) {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('idea_id', params.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestones.');
      // Optionally, redirect or show an error message
    } else {
      setMilestones(data || []);
    }
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading roadmap...</p>
      </div>
    );
  }

  // If no milestones and not loading, we assume the idea might be invalid or there are no milestones yet.
  // For now, if no milestones, we just show an empty state. If idea_id is invalid, Supabase query would error.
  if (!milestones && !loading) {
    // This case might only happen if fetchMilestones sets milestones to null which it doesn't.
    // So, we can just handle milestones.length === 0 below.
  }

  const sensors = useSensors(
    useSensors(
      PointerSensor,
    )
  );

  const handleDragStart = (event: any) => {
    console.log('Drag started', event);
  };

  const handleDragEnd = (event: any) => {
    console.log('Drag ended', event);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Link href={`/ideas/${params.id}`} className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Idea Details
          </Link>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white">Roadmap for Idea {params.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Milestones will appear here in a Kanban board layout.</p>
              {milestones.length === 0 ? (
                  <p className="text-slate-500 mt-4">No milestones yet. Time to plan!</p>
              ) : (
                  <div className="mt-4">
                      {milestones.map((milestone) => (
                          <div key={milestone.id} className="p-2 border-b border-slate-700">
                              {milestone.title} - {milestone.status}
                          </div>
                      ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <DragOverlay>{/* We'll render the draggable item here later */}</DragOverlay>
    </DndContext>
  );
}
