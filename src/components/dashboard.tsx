'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client'
import { Idea } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Filter, LogOut, Mic } from 'lucide-react' // Added Mic icon
import { IdeaCard } from './idea-card'
import { CreateIdeaModal } from './create-idea-modal'
import { VoiceCaptureModal } from './voice-capture-modal'; // New import for VoiceCaptureModal
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

export function Dashboard({ user }: { user: User }) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVoiceCaptureModal, setShowVoiceCaptureModal] = useState(false); // New state for voice capture modal
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchIdeas()
    
    // Real-time subscription
    const channel = supabase
      .channel('ideas-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success(`New idea added: ${(payload.new as Idea).title}`)
            setIdeas(prev => [payload.new as Idea, ...prev].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)))
          } else {
            // For UPDATE and DELETE, a full refetch is simpler for now
            fetchIdeas()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchIdeas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('priority_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Failed to load ideas')
      console.error('Fetch ideas error:', error)
    } else {
      setIdeas(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const filteredIdeas = ideas.filter(idea => {
    if (filter === 'all') return true
    if (filter === 'high-priority') return (idea.priority_score || 0) > 15
    return idea.status === filter
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">Plan</h1>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">
              {ideas.length} ideas
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300">
                Projects
              </Button>
            </Link>
            <Button 
              onClick={() => setShowVoiceCaptureModal(true)} // New Voice Capture Button
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Capture
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Idea
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'high-priority', 'captured', 'validating', 'building', 'shipped'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={`capitalize whitespace-nowrap ${filter === f ? 'bg-blue-500 hover:bg-blue-600' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'}`}
            >
              {f.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your brain...</div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No ideas found for this filter.</h3>
            <p className="mt-2">Why not capture a new one? 🚀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onUpdate={fetchIdeas} />
            ))}
          </div>
        )}
      </main>

      <CreateIdeaModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          fetchIdeas();
          setShowCreateModal(false);
        }}
      />
      <VoiceCaptureModal // New Voice Capture Modal integration
        open={showVoiceCaptureModal}
        onClose={() => setShowVoiceCaptureModal(false)}
        onCaptured={(transcript) => {
            // Option 1: Directly create idea from transcript
            // Option 2: Pass transcript to CreateIdeaModal (more flexible)
            setShowCreateModal(true); // Open CreateIdeaModal
            // Need to pass transcript to CreateIdeaModal, will refactor later
            console.log('Voice captured:', transcript);
            fetchIdeas();
            setShowVoiceCaptureModal(false);
        }}
      />
    </div>
  )
}