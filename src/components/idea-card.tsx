import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import Link from 'next/link';

export function IdeaCard({ idea, onUpdate }: { idea: Idea, onUpdate: () => void }) {
    const priorityColor = (score: number | null) => {
        if (score === null) return 'bg-slate-600';
        if (score > 15) return 'bg-red-500';
        if (score > 10) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    return (
        <Link href={`/ideas/${idea.id}`} className="block">
            <Card className="bg-slate-800/50 border-slate-700 flex flex-col h-full hover:border-blue-500 hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer">
                <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                        <span>{idea.title}</span>
                        <Badge className={priorityColor(idea.priority_score)}>
                            {idea.priority_score?.toFixed(2) ?? 'N/A'}
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-400 capitalize">{idea.category} • {idea.status}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-slate-400 line-clamp-3">{idea.description}</p>
                </CardContent>
                <CardFooter className="text-xs text-slate-500">
                    <p>Created on {new Date(idea.created_at).toLocaleDateString()}</p>
                </CardFooter>
            </Card>
        </Link>
    )
}
