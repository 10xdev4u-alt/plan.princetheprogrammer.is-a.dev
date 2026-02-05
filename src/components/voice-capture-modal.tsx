'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { Mic, StopCircle, Check } from 'lucide-react'; // Icons for start, stop, confirm

interface VoiceCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCaptured: (transcript: string) => void;
}

// Declare SpeechRecognition and SpeechGrammarList if not already globally defined
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function VoiceCaptureModal({ open, onClose, onCaptured }: VoiceCaptureModalProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            toast.error("Speech Recognition is not supported in this browser.");
            onClose();
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Listen for a single utterance
        recognitionRef.current.interimResults = true; // Get results while speaking
        recognitionRef.current.lang = 'en-US'; // Set language

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setTranscript(''); // Clear previous transcript
        };

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setTranscript(prev => prev + event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // You can choose to display interimTranscript too if needed
            // For now, only update final transcript in state
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
            if (!transcript) { // If no final transcript captured, toast error
                toast.info("No speech detected or unclear. Try again.");
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            setIsListening(false);
            console.error("Speech recognition error:", event.error);
            toast.error(`Speech recognition error: ${event.error}.`);
            onClose(); // Close modal on error
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [open, onClose, transcript]); // Depend on open to re-initialize if needed, and transcript for onend check

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript(''); // Clear on new start
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const handleConfirm = () => {
        stopListening();
        if (transcript) {
            onCaptured(transcript);
        } else {
            toast.info("No text to capture. Speak something first!");
        }
        onClose();
    };

    const handleClose = () => {
        stopListening();
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Voice Capture Idea</DialogTitle>
                    <DialogDescription>
                        Speak your idea. We'll transcribe it for you.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-center">
                    <p className="text-sm text-slate-400">
                        {isListening ? "Listening..." : "Click the mic to start speaking."}
                    </p>
                    <div className="min-h-[80px] p-3 border border-slate-700 rounded-md bg-slate-800 text-left text-white break-words">
                        {transcript || (isListening ? "Say something..." : "Your transcribed idea will appear here.")}
                    </div>
                </div>
                <DialogFooter className="flex justify-center gap-2">
                    <Button 
                        onClick={isListening ? stopListening : startListening}
                        disabled={!SpeechRecognition}
                        className={`w-12 h-12 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center justify-center`}
                    >
                        {isListening ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={!transcript || isListening}
                        className="bg-green-500 hover:bg-green-600 text-white"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
