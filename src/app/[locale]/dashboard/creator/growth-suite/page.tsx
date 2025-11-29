'use client';

import { useState } from 'react';
import { Rocket, Calendar, PenTool, Share2, Lock, CheckCircle2, BarChart2, FileText, TrendingUp } from 'lucide-react';

export default function GrowthSuitePage() {
    // Mock user plan state - toggle this to test locked/unlocked state
    const [hasGrowthPlan, setHasGrowthPlan] = useState(false);

    if (!hasGrowthPlan) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '3rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)',
                    maxWidth: '800px',
                    width: '100%',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--bg-background)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Lock size={40} className="text-primary" />
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Unlock Growth Suite
                    </h1>

                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Supercharge your creator journey with our comprehensive AI-powered toolkit.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        textAlign: 'left',
                        marginBottom: '2.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 className="text-primary" size={20} />
                            <span style={{ fontWeight: '500' }}>AI Content Organizer & Calendar</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 className="text-primary" size={20} />
                            <span style={{ fontWeight: '500' }}>AI Content Writer & Caption Generator</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 className="text-primary" size={20} />
                            <span style={{ fontWeight: '500' }}>Auto-Publication to Social Media</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 className="text-primary" size={20} />
                            <span style={{ fontWeight: '500' }}>Advanced Analytics & Insights</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 className="text-primary" size={20} />
                            <span style={{ fontWeight: '500' }}>Smart Media Kit Generator</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle2 className="text-primary" size={20} />
                            <span style={{ fontWeight: '500' }}>Trend Spotter AI Alerts</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setHasGrowthPlan(true)} // Mock upgrade
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: 'var(--border-radius-md)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%'
                        }}
                    >
                        <Rocket size={20} />
                        Upgrade to Growth Plan
                    </button>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Starting at 49 SAR/month
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Rocket className="text-primary" />
                        Growth Suite
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Manage your content lifecycle with AI.
                    </p>
                </div>
                <div style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(var(--primary-rgb), 0.1)',
                    color: 'var(--color-primary)',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}>
                    Growth Plan Active
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Content Organizer */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-background)', borderRadius: '12px' }}>
                            <Calendar size={24} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Content Organizer</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Plan your posts with our AI-smart calendar. Drag and drop to reschedule.
                    </p>
                    <div style={{ height: '150px', background: 'var(--bg-background)', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        Calendar Placeholder
                    </div>
                </div>

                {/* AI Writer */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-background)', borderRadius: '12px' }}>
                            <PenTool size={24} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AI Writer</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Generate engaging captions and hashtags instantly.
                    </p>
                    <button style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-md)',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        Open Writer
                    </button>
                </div>

                {/* Auto Publisher */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-background)', borderRadius: '12px' }}>
                            <Share2 size={24} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Auto Publisher</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Automatically post to your connected accounts at peak times.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-background)', borderRadius: 'var(--border-radius-md)' }}>
                        <span>Active Accounts</span>
                        <span style={{ fontWeight: 'bold' }}>2</span>
                    </div>
                </div>

                {/* Advanced Analytics */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-background)', borderRadius: '12px' }}>
                            <BarChart2 size={24} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Advanced Analytics</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Deep dive into your audience demographics and content performance.
                    </p>
                    <div style={{ height: '100px', background: 'var(--bg-background)', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'end', justifyContent: 'space-around', paddingBottom: '10px' }}>
                        <div style={{ width: '10px', height: '40%', background: 'var(--text-secondary)' }}></div>
                        <div style={{ width: '10px', height: '70%', background: 'var(--text-secondary)' }}></div>
                        <div style={{ width: '10px', height: '50%', background: 'var(--text-secondary)' }}></div>
                        <div style={{ width: '10px', height: '90%', background: 'var(--color-primary)' }}></div>
                    </div>
                </div>

                {/* Smart Media Kit */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-background)', borderRadius: '12px' }}>
                            <FileText size={24} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Smart Media Kit</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Auto-generate a professional media kit to pitch to brands.
                    </p>
                    <button style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        View Media Kit
                    </button>
                </div>

                {/* Trend Spotter */}
                <div style={{
                    background: 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-background)', borderRadius: '12px' }}>
                            <TrendingUp size={24} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Trend Spotter</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Get AI alerts for rising trends in your niche before they go viral.
                    </p>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-background)', borderRadius: 'var(--border-radius-md)', fontSize: '0.9rem' }}>
                        🔥 #SaudiCoffee is trending...
                    </div>
                </div>
            </div>
        </div>
    );
}
