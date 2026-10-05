import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './EventDetail.css';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const POSTER_GRADIENTS = [
  ['#7c2d12', '#dc2626'],
  ['#1e1b4b', '#6d28d9'],
  ['#0c4a6e', '#0ea5e9'],
  ['#064e3b', '#059669'],
];

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [movie, setMovie]         = useState(null);
  const [seats, setSeats]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [locking, setLocking]     = useState(false);
  const [error, setError]         = useState(null);

  const [selectedShow, setSelectedShow]     = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('2D');
  const [selectedSeats, setSelectedSeats]   = useState([]);

  // Fetch movie details
  const loadMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const movieRes = await api.get(`/events/${id}`);
      const m = movieRes.data.event;
      setMovie(m);
      
      const initialShow = m?.showTimes?.[0] || '10:30 AM';
      setSelectedShow(initialShow);
      fetchSeatsForShowtime(initialShow);
    } catch (err) {
      console.error('Failed to load movie details:', err);
      setError('Could not load movie details from server.');
      showToast('Could not load movie details from server', 'error');
      setLoading(false);
    }
  };

  // Fetch seats specifically for the selected showtime
  const fetchSeatsForShowtime = async (st) => {
    try {
      const seatsRes = await api.get(`/events/${id}/seats`, {
        params: { showTime: st }
      });
      setSeats(seatsRes.data.seats || []);
    } catch (err) {
      console.error('Failed to load seats for showtime:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovie();
  }, [id]);

  // Real-time Socket.IO Sync Listener
  useEffect(() => {
    if (!id || !selectedShow) return;

    const socket = io(SOCKET_SERVER_URL, { transports: ['websocket', 'polling'] });

    socket.emit('join:event', { eventId: id, showTime: selectedShow });

    socket.on('seats:updated', (data) => {
      if (data.eventId === id && data.showTime === selectedShow) {
        fetchSeatsForShowtime(selectedShow);
        showToast(`⚡ Real-time update: Seats map updated for ${selectedShow}`, 'info');
      }
    });

    return () => {
      socket.emit('leave:event', { eventId: id, showTime: selectedShow });
      socket.disconnect();
    };
  }, [id, selectedShow]);

  const handleShowtimeChange = (st) => {
    setSelectedShow(st);
    setSelectedSeats([]);
    fetchSeatsForShowtime(st);
  };

  const toggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    setSelectedSeats(prev => {
      const exists = prev.some(s => s._id === seat._id);
      if (exists) return prev.filter(s => s._id !== seat._id);
      if (prev.length >= 6) {
        showToast('Max 6 seats can be selected per transaction', 'warning');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.some(s => s._id === seat._id);
    if (isSelected) return 'seat seat-selected';
    if (seat.status === 'LOCKED') return 'seat seat-locked';
    if (seat.status === 'BOOKED') return 'seat seat-sold';
    return 'seat seat-available';
  };

  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || movie?.price || 250), 0);
  const convenience = selectedSeats.length > 0 ? 30 * selectedSeats.length : 0;
  const total = subtotal + convenience;

  const handleProceedToPay = async () => {
    if (selectedSeats.length === 0) return;

    try {
      setLocking(true);

      const seatDbIds = selectedSeats.map(s => s._id);
      await api.post('/seats/lock', {
        eventId: movie._id,
        seatIds: seatDbIds,
        durationMinutes: 10
      });

      showToast(`🔒 ${selectedSeats.length} Seat(s) locked for ${selectedShow}!`, 'success');

      setTimeout(() => {
        navigate('/checkout', {
          state: {
            eventId: movie._id,
            movieTitle: movie.title,
            showtime: selectedShow,
            format: selectedFormat,
            seatIds: seatDbIds,
            seatLabels: selectedSeats.map(s => s.label),
            total,
          }
        });
      }, 400);

    } catch (err) {
      console.error('Lock error:', err);
      const msg = err.response?.data?.error?.message || 'Failed to lock selected seats.';
      showToast(msg, 'error');
      fetchSeatsForShowtime(selectedShow);
    } finally {
      setLocking(false);
    }
  };

  if (loading && !movie) {
    return (
      <div className="page-wrapper" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="empty-state">
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <h3>Fetching Movie & Seat Map...</h3>
        </div>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>⚠️ {error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
            ← Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const [c1, c2] = POSTER_GRADIENTS[0];

  // Group seats by row for current showtime
  const seatRows = {};
  seats.forEach(s => {
    if (!seatRows[s.row]) seatRows[s.row] = [];
    seatRows[s.row].push(s);
  });

  return (
    <div className="movie-detail-page">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero Banner */}
        <div className="movie-hero-banner">
          <div className="movie-hero-bg" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
          <div className="movie-hero-content">
            <div className="movie-hero-poster" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
              {movie.emoji || '🎬'}
            </div>
            <div className="movie-hero-info">
              <span className="movie-cert">{movie.certification || 'UA'}</span>
              <h1 className="movie-hero-title">{movie.title}</h1>
              <div className="movie-rating-badge">⭐ {movie.rating || '8.5'} / 10</div>
              <div className="movie-hero-meta">
                <span>🎭 {movie.genre}</span>
                <span>⏱️ {movie.durationMinutes || 150} mins</span>
                <span>🗣️ {(movie.languages || ['Hindi']).join(', ')}</span>
              </div>
              <div className="movie-format-row">
                {['2D','3D','IMAX 3D'].map(f => (
                  <button key={f} className={`movie-format-btn ${selectedFormat === f ? 'active' : ''}`} onClick={() => setSelectedFormat(f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Showtime Picker (Independent Seats per Showtime) */}
        <div className="showtime-section">
          <h2>📅 Select Showtime — {movie.venue || 'PVR Inox, Phoenix Mall'}</h2>
          <div className="showtimes-row">
            {(movie.showTimes || ['10:30 AM', '02:15 PM', '06:00 PM', '09:30 PM']).map((st) => (
              <button
                key={st}
                className={`showtime-btn ${selectedShow === st ? 'active' : ''}`}
                onClick={() => handleShowtimeChange(st)}
              >
                {st}
                <span className="avail-tag avail-available">Real-time Socket.IO Sync</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Seat Map for Selected Showtime */}
        <div className="seat-selection-layout">
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 24 }}>
              🪑 Screen Seat Map — <span style={{ color: 'var(--primary)' }}>{selectedShow}</span>
            </h2>
            <div className="cinema-screen">All Eyes This Way Please! (Screen)</div>

            {Object.keys(seatRows).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading seats for {selectedShow}...</p>
              </div>
            ) : (
              Object.keys(seatRows).sort().map(r => (
                <div key={r} className="seat-row" style={{ justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className="seat-row-label">{r}</span>
                  {seatRows[r].sort((a,b) => a.col - b.col).map(seat => (
                    <button
                      key={seat._id}
                      className={getSeatClass(seat)}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status !== 'AVAILABLE'}
                      title={`${seat.label} - ₹${seat.price} (${seat.status})`}
                    >
                      {seat.col}
                    </button>
                  ))}
                  <span className="seat-row-label">{r}</span>
                </div>
              ))
            )}

            {/* Legend */}
            <div className="seat-legend" style={{ marginTop: 24 }}>
              {[
                { color: 'var(--seat-available)', label: 'Available' },
                { color: 'var(--seat-selected-me)', label: 'Your Selection' },
                { color: 'var(--seat-locked-other)', label: 'Locked' },
                { color: 'var(--seat-sold)', label: 'Sold Out' },
              ].map(l => (
                <div key={l.label} className="legend-item">
                  <div className="legend-dot" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="booking-sidebar-card">
              <h3>🎟️ Booking Summary</h3>
              <div className="booking-info-row">
                <span className="booking-info-label">Movie</span>
                <span className="booking-info-value" style={{ textAlign:'right', maxWidth:160 }}>{movie.title}</span>
              </div>
              <div className="booking-info-row">
                <span className="booking-info-label">Showtime</span>
                <span className="booking-info-value" style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedShow}</span>
              </div>
              <div className="booking-info-row">
                <span className="booking-info-label">Seats</span>
                <div className="booking-seats-selected">
                  {selectedSeats.length === 0
                    ? <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>None selected</span>
                    : selectedSeats.map(s => <span key={s._id} className="booking-seat-tag">{s.label}</span>)
                  }
                </div>
              </div>
              <div className="booking-info-row">
                <span className="booking-info-label">Subtotal</span>
                <span className="booking-info-value">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {convenience > 0 && (
                <div className="booking-info-row">
                  <span className="booking-info-label">Convenience Fee</span>
                  <span className="booking-info-value">₹{convenience.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="booking-total-row">
                <span className="booking-total-label">Total</span>
                <span className="booking-total-amount">₹{total.toLocaleString('en-IN')}</span>
              </div>

              <button
                id="proceed-to-payment-btn"
                className="btn btn-primary btn-full btn-lg"
                disabled={selectedSeats.length === 0 || locking}
                onClick={handleProceedToPay}
              >
                {locking ? <><span className="spinner" /> Locking Seats...</> : '🔒 Lock Seats & Pay'}
              </button>
              {selectedSeats.length > 0 && (
                <p className="lock-timer-note">⏱️ Seats locked for 10 mins for {selectedShow}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
