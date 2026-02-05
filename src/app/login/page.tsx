'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGithubLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setLoading(false)
      console.error('GitHub login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <CardTitle className="text-2xl text-white">Plan</CardTitle>
          <CardDescription className="text-slate-400">
            Capture ideas. Validate. Execute.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
          >
            <Github className="mr-2 h-4 w-4" />
            {loading ? 'Redirecting...' : 'Continue with GitHub'}
          </Button>
          <p className="text-xs text-center text-slate-500">
            Built by PrinceTheProgrammer • Free Forever
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
