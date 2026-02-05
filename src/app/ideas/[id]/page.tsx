'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { Idea } from '@/types/database';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Lightbulb, HelpCircle, BatteryLow } from 'lucide-react'; // Consolidated lucide-react imports
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button'; // Added Button import
import { toast } from 'sonner';

interface IdeaDetailPageProps {
  params: {
    id: string;
  };
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const supabase = createClient();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState<number[]>(idea?.impact_score ? [idea.impact_score] : [5]);
  const [effort, setEffort] = useState<number[]>(idea?.effort_score ? [idea.effort_score] : [5]);
  const [excitement, setExcitement] = useState<number[]>(idea?.excitement_score ? [idea.excitement_score] : [5]);

  const fetchIdea = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      console.error('Error fetching idea:', error);
      notFound();
    }
    setIdea(data);
    setImpact([data.impact_score || 5]);
    setEffort([data.effort_score || 5]);
    setExcitement([data.excitement_score || 5]);
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const updateIdeaScores = useCallback(
    debounce(async (updatedScores: { impact_score?: number; effort_score?: number; excitement_score?: number }) => {
      if (!idea) return;
      const { error } = await supabase
        .from('ideas')
        .update({ ...updatedScores, updated_at: new Date().toISOString() })
        .eq('id', idea.id);

      if (error) {
        toast.error('Failed to update scores.');
        console.error('Update scores error:', error);
      } else {
        toast.success('Scores updated! 🎉');
        // Re-fetch the idea to get the new calculated priority_score
        fetchIdea(); 
      }
    }, 500),
    [idea, supabase, fetchIdea]
  );

  const handleScoreChange = (scoreType: 'impact_score' | 'effort_score' | 'excitement_score', value: number[]) => {
    const score = value[0];
    if (!idea) return;

    let updatedScores: { impact_score?: number; effort_score?: number; excitement_score?: number } = {};
    if (scoreType === 'impact_score') {
      setImpact(value);
      updatedScores.impact_score = score;
    } else if (scoreType === 'effort_score') {
      setEffort(value);
      updatedScores.effort_score = score;
    } else {
      setExcitement(value);
      updatedScores.excitement_score = score;
    }
    updateIdeaScores(updatedScores);
  };

  const priorityColor = (score: number | null) => {
    if (score === null) return 'bg-slate-600';
    if (score > 15) return 'bg-red-500';
    if (score > 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const validationQuestions = [
    "Does this idea solve a real problem?",
    "Do I have the necessary skills or resources to build this?",
    "Is there a target audience for this idea?",
    "Can this idea be broken down into smaller, manageable milestones?",
    "Am I truly excited to work on this for an extended period?"
  ];

  const getRecommendation = (idea: Idea) => {
    const score = idea.priority_score || 0;
    if (score >= 20) {
      return {
        title: "Absolute Must-Build! 🚀",
        message: "This idea has exceptionally high potential. Prioritize it!",
        color: "bg-green-500/20 border border-green-400 text-green-300",
        icon: <Sparkles className="w-6 h-6" />
      };
    } else if (score >= 10) {
      return {
        title: "Strong Candidate! 💪",
        message: "A promising idea. Worth further investigation and planning.",
        color: "bg-blue-500/20 border border-blue-400 text-blue-300",
        icon: <Lightbulb className="w-6 h-6" />
      };
    } else if (score >= 5) {
      return {
        title: "Consider Carefully 🤔",
        message: "This idea has some potential but needs refinement or more compelling reasons.",
        color: "bg-yellow-500/20 border border-yellow-400 text-yellow-300",
        icon: <HelpCircle className="w-6 h-6" />
      };
    } else {
      return {
        title: "Low Priority 😴",
        message: "The current scores suggest this might not be the best use of your time.",
        color: "bg-red-500/20 border border-red-400 text-red-300",
        icon: <BatteryLow className="w-6 h-6" />
      };
    }
  };

  const recommendation = getRecommendation(idea);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading idea details...</p>
      </div>
    );
  }

  if (!idea) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-3xl font-bold text-white">{idea.title}</CardTitle>
              <div className="flex items-center gap-2"> {/* Added div for Badge and Button */}
                <Badge className={priorityColor(idea.priority_score)}>
                  Priority: {idea.priority_score?.toFixed(2) ?? 'N/A'}
                </Badge>
                <Link href={`/ideas/${idea.id}/roadmap`}>
                  <Button variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white">
                    Roadmap
                  </Button>
                </Link>
              </div>
            </div>
            <CardDescription className="text-slate-400 capitalize">
              {idea.category} • {idea.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description:</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{idea.description || 'No description provided.'}</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2">Validate Your Idea:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="impact-slider" className="text-base font-medium text-slate-300 flex justify-between items-center">
                            Impact <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">{impact[0]}</Badge>
                        </label>
                        <Slider
                            id="impact-slider"
                            min={1}
                            max={10}
                            step={1}
                            value={impact}
                            onValueChange={(val) => handleScoreChange('impact_score', val)}
                            className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-500 [&>span:first-child]:shadow-blue-500/50"
                            thumbClassName="[&>span]:bg-blue-500 [&>span]:shadow-lg"
                        />
                        <p className="text-xs text-slate-500">How big is the potential positive outcome (1-10)?</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="effort-slider" className="text-base font-medium text-slate-300 flex justify-between items-center">
                            Effort <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">{effort[0]}</Badge>
                        </label>
                        <Slider
                            id="effort-slider"
                            min={1}
                            max={10}
                            step={1}
                            value={effort}
                            onValueChange={(val) => handleScoreChange('effort_score', val)}
                            className="[&>span:first-child]:h-2 [&>span:first-child]:bg-amber-500 [&>span:first-child]:shadow-amber-500/50"
                            thumbClassName="[&>span]:bg-amber-500 [&>span]:shadow-lg"
                        />
                        <p className="text-xs text-slate-500">How much work is required (1-10)?</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="excitement-slider" className="text-base font-medium text-slate-300 flex justify-between items-center">
                            Excitement <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">{excitement[0]}</Badge>
                        </label>
                        <Slider
                            id="excitement-slider"
                            min={1}
                            max={10}
                            step={1}
                            value={excitement}
                            onValueChange={(val) => handleScoreChange('excitement_score', val)}
                            className="[&>span:first-child]:h-2 [&>span:first-child]:bg-emerald-500 [&>span:first-child]:shadow-emerald-500/50"
                            thumbClassName="[&>span]:bg-emerald-500 [&>span]:shadow-lg"
                        />
                        <p className="text-xs text-slate-500">How excited are you to build this (1-10)?</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">Validation Checklist:</h3>
                <div className="space-y-2">
                    {validationQuestions.map((question, index) => (
                        <div key={index} className="flex items-center space-x-2 text-slate-300">
                            <input type="checkbox" id={`question-${index}`} className="form-checkbox h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded" />
                            <label htmlFor={`question-${index}`} className="text-sm cursor-pointer">{question}</label>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500">Use this checklist to thoroughly evaluate your idea.</p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">Recommendation:</h3>
                <div className={`p-4 rounded-lg flex items-center gap-3 ${recommendation.color}`}>
                    {recommendation.icon}
                    <div>
                        <p className="font-bold text-lg">{recommendation.title}</p>
                        <p className="text-sm">{recommendation.message}</p>
                    </div>
                </div>
            </div>
            
            <p className="text-sm text-slate-500 mt-4">
                Captured on {new Date(idea.created_at).toLocaleDateString()}
                {idea.updated_at && ` • Last updated on ${new Date(idea.updated_at).toLocaleDateString()}`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}