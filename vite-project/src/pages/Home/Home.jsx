import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './Home.css';

const GENRES = ['All', 'Action', 'Horror', 'Sci-Fi', 'Comedy', 'Drama'];
const LANGS  = ['All Languages', 'Hindi', 'English', 'Telugu', 'Tamil'];

const POSTER_GRADIENTS = [
  ['#7c2d12', '#dc2626'],
  ['#1e1b4b', '#6d28d9'],
  ['#0c4a6e', '#0ea5e9'],
  ['#064e3b', '#059669'],
  ['#451a03', '#b45309'],
  ['#1a0a2e', '#9333ea'],
  ['#0c2340', '#1d4ed8'],
  ['#1c1917', '#d97706'],
];

export default function Home() {
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [genre, setGenre]     = useState('All');
  const [lang, setLang]       = useState('All Languages');

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', {
        params: { search, genre, lang }
      });
      setMovies(res.data.events || []);
    } catch (err) {
      console.error('Failed to load movies from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [genre, lang]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  return (
    <div className="page-wrapper">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-badge">🎬 Live Movies Connected to Backend MongoDB</div>
          <h1>Book Movie Tickets<br /><span className="gradient-text">Instantly. No Waiting.</span></h1>
          <p>Real-time seat availability. Lock your seats in seconds. BookMyShow experience powered by atomic backend locking.</p>

          {/* Search */}
          <form className="home-search-bar" onSubmit={handleSearchSubmit}>
            <div className="home-search-wrapper">
              <span className="home-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </span>
              <input
                id="home-search"
                className="form-input"
                placeholder="Search movies, theatres…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </section>

        {/* Quick book banner */}
        <div className="quick-book-banner">
          <div>
            <h2>🎟️ Weekend Special Offers</h2>
            <p>Early bird seats from ₹99 · VIP seats · Instant QR Tickets</p>
          </div>
          <button className="btn btn-primary btn-lg">Explore Offers</button>
        </div>

        {/* Language filter */}
        <div className="filter-bar" style={{ marginBottom: 12 }}>
          {LANGS.map(l => (
            <button key={l} className={`filter-chip ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{l}</button>
          ))}
        </div>

        {/* Genre filter */}
        <div className="filter-bar">
          {GENRES.map(g => (
            <button key={g} id={`filter-${g.toLowerCase().replace(' ','-')}`} className={`filter-chip ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>{g}</button>
          ))}
        </div>

        {/* Movies Section */}
        <div className="section-header">
          <h2 className="section-title">
            🎬 Now Showing
            <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.85rem', marginLeft: 8 }}>
              ({movies.length} movies in database)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <h3>Loading Movies from Backend...</h3>
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h3>No movies found</h3>
            <p>Try different filters or search terms.</p>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((m, idx) => {
              const [c1, c2] = POSTER_GRADIENTS[idx % POSTER_GRADIENTS.length];
              return (
                <Link key={m._id} to={`/movie/${m._id}`} className="movie-card">
                  {/* Poster */}
                  <div className="movie-poster" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    <div className="movie-poster-bg">{m.emoji || '🎬'}</div>
                    <div className="movie-poster-overlay" />
                    <div className="movie-poster-rating">⭐ {m.rating || '8.5'}</div>
                    <div className="movie-poster-lang">
                      <div className="format-tags">
                        {(m.languages || ['Hindi']).map(l => <span key={l} className="format-tag">{l}</span>)}
                      </div>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="movie-card-body">
                    <div className="movie-card-title">{m.title}</div>
                    <div className="movie-card-genre">{m.genre}</div>
                    <div className="movie-card-footer">
                      <span className="format-tag">{m.certification || 'UA'}</span>
                      <span className="movie-card-cta">Book Tickets →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
