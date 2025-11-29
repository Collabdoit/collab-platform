'use client';

import { useState } from 'react';
import { Search, Filter, MapPin, Users, Star } from 'lucide-react';

export default function CreatorSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Lifestyle', 'Beauty', 'Tech', 'Food', 'Travel'];

    // Mock Data
    const creators = [
        { id: 1, name: 'Sarah Ahmed', handle: '@sarahstyle', category: 'Lifestyle', followers: '150K', location: 'Riyadh', rating: 4.8, image: 'S' },
        { id: 2, name: 'Tech Reviewer', handle: '@techsaudi', category: 'Tech', followers: '500K', location: 'Jeddah', rating: 4.9, image: 'T' },
        { id: 3, name: 'Chef Noura', handle: '@nourakitchen', category: 'Food', followers: '85K', location: 'Dammam', rating: 4.7, image: 'N' },
        { id: 4, name: 'Travel with Ali', handle: '@alitravels', category: 'Travel', followers: '200K', location: 'Riyadh', rating: 4.6, image: 'A' },
        { id: 5, name: 'Beauty Queen', handle: '@beautybyfatima', category: 'Beauty', followers: '320K', location: 'Jeddah', rating: 4.9, image: 'B' },
    ];

    const filteredCreators = creators.filter(creator => {
        const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            creator.handle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || creator.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Find Creators</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Discover the perfect influencers for your next campaign.</p>
            </div>

            {/* Search and Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                background: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search className="text-secondary" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or handle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '5px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '20px',
                                border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                                background: selectedCategory === cat ? 'var(--color-primary)' : 'white',
                                color: selectedCategory === cat ? 'white' : 'var(--text-primary)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Creators Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredCreators.map(creator => (
                    <div key={creator.id} style={{
                        background: 'white',
                        borderRadius: 'var(--border-radius-lg)',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                    }}>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--bg-surface)',
                                borderRadius: '50%',
                                margin: '0 auto 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: 'var(--color-primary)'
                            }}>
                                {creator.image}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{creator.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{creator.handle}</p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <span style={{ padding: '0.25rem 0.75rem', background: 'var(--bg-surface)', borderRadius: '15px', fontSize: '0.875rem' }}>{creator.category}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                    <Users size={16} className="text-secondary" />
                                    <span style={{ fontWeight: '600' }}>{creator.followers}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={16} className="text-secondary" />
                                    <span style={{ fontWeight: '600' }}>{creator.location}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                    <Star size={16} className="text-warning" fill="currentColor" />
                                    <span style={{ fontWeight: '600' }}>{creator.rating}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-surface)', textAlign: 'center' }}>
                            <button style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 2rem',
                                borderRadius: 'var(--border-radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%'
                            }}>
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
