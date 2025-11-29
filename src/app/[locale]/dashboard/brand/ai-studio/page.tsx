'use client';

import { useState } from 'react';
import { Video, Wand2, Loader2, Play, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AIStudioPage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedVideo(null);

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (data.videoUrl) {
                setGeneratedVideo(data.videoUrl);
            }
        } catch (error) {
            console.error('Failed to generate video:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wand2 className="text-primary" />
                    AI Studio
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Generate high-converting UGC video ads in seconds using Google Veo AI.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Input Section */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Create New Ad</h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Describe your video
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., A Saudi influencer unboxing a new coffee machine in a modern kitchen, enthusiastic tone, 4k resolution..."
                            style={{
                                width: '100%',
                                height: '150px',
                                padding: '1rem',
                                borderRadius: 'var(--border-radius-md)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-background)',
                                color: 'var(--text-primary)',
                                resize: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Style
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Cinematic', 'UGC / TikTok', 'Professional', 'Lifestyle'].map((style) => (
                                <button
                                    key={style}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-background)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius-md)',
                            fontWeight: '600',
                            cursor: (!prompt.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                            opacity: (!prompt.trim() || isGenerating) ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Generating Magic...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Generate Video
                            </>
                        )}
                    </button>
                </div>

                {/* Preview Section */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    {generatedVideo ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '9/16',
                                background: '#000',
                                borderRadius: 'var(--border-radius-md)',
                                overflow: 'hidden'
                            }}>
                                <video
                                    src={generatedVideo}
                                    controls
                                    autoPlay
                                    loop
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--border-radius-md)',
                                background: 'white',
                                color: 'black',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}>
                                <Download size={18} />
                                Download Video
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--bg-background)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Video size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Video Generated Yet</h3>
                            <p>Enter a prompt and click generate to see the magic happen.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
