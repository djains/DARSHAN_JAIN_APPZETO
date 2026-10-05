import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Admin.css';

export default function Admin() {
  const { showToast }             = useToast();
  const [stats, setStats]         = useState(null);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const [form, setForm] = useState({
    title: '',
    genre: 'Action · Thriller',
    venue: 'PVR Inox, Phoenix Mall',
    price: '250',
    totalRows: '6',
    seatsPerRow: '8',
    description: 'High-octane movie experience with immersive sound.'
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/events')
      ]);
      setStats(statsRes.data.stats);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Could not fetch admin statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);

      await api.post('/events', {
        title: form.title,
        genre: form.genre,
        venue: form.venue,
        price: Number(form.price),
        totalRows: Number(form.totalRows),
        seatsPerRow: Number(form.seatsPerRow),
        description: form.description,
        status: 'PUBLISHED'
      });

      showToast(`✨ Movie "${form.title}" created with auto-generated seat grid!`, 'success');
      setForm({
        title: '',
        genre: 'Action · Thriller',
        venue: 'PVR Inox, Phoenix Mall',
        price: '250',
        totalRows: '6',
        seatsPerRow: '8',
        description: 'High-octane movie experience with immersive sound.'
      });
      loadAdminData();
    } catch (err) {
      console.error('Failed to create event:', err);
      const msg = err.response?.data?.error?.message || 'Could not create event';
      showToast(`⚠️ ${msg}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setDeleting(eventId);
      await api.delete(`/events/${eventId}`);
      showToast(`🗑️ Movie "${title}" deleted from database.`, 'success');
      loadAdminData();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete movie', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const STAT_CARDS = [
    { icon: '🎭', value: stats?.totalEvents || events.length, label: 'Total Movies' },
    { icon: '🎫', value: stats?.totalBookings || 0, label: 'Confirmed Bookings' },
    { icon: '💰', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, label: 'Total Revenue' },
    { icon: '🪑', value: `${stats?.bookedSeats || 0} / ${stats?.totalSeats || 0}`, label: 'Booked Seats' },
    { icon: '🟡', value: stats?.lockedSeats || 0, label: 'Active Seat Locks' },
    { icon: '📊', value: `${stats?.occupancyRate || 0}%`, label: 'Occupancy Rate' },
  ];

  return (
    <div className="admin-page">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <div className="admin-header">
          <h1>🛡️ Admin Console (AppZeto Movies)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage movies, view real-time database analytics and seat occupancy.</p>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="admin-stat-card">
              <div className="admin-stat-icon">{s.icon}</div>
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create Movie Form */}
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-title">➕ Add New Movie to Database</div>
          <form className="create-event-form" onSubmit={handleCreateEvent}>
            <div className="form-group">
              <label className="form-label">Movie Title</label>
              <input
                className="form-input"
                placeholder="e.g. War 2"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Genre</label>
                <input
                  className="form-input"
                  placeholder="Action · Sci-Fi"
                  value={form.genre}
                  onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ticket Price (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Theatre / Venue</label>
              <input
                className="form-input"
                placeholder="PVR Inox, Phoenix Mall"
                value={form.venue}
                onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rows (e.g. 6 = A-F)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="10"
                  value={form.totalRows}
                  onChange={e => setForm(f => ({ ...f, totalRows: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Seats per Row</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="15"
                  value={form.seatsPerRow}
                  onChange={e => setForm(f => ({ ...f, seatsPerRow: e.target.value }))}
                />
              </div>
            </div>

            <button id="create-event-btn" type="submit" className="btn btn-primary btn-full" disabled={creating}>
              {creating ? <><span className="spinner" /> Creating Movie & Generating Seats...</> : '✨ Save Movie to Database'}
            </button>
          </form>
        </div>

        {/* Movies Table */}
        <div className="admin-card">
          <div className="admin-card-title">🎬 Managed Movies in Database</div>
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
              <h3>Loading Database Movies...</h3>
            </div>
          ) : events.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No movies stored in database yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Genre</th>
                  <th>Venue</th>
                  <th>Price</th>
                  <th>Grid Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id}>
                    <td style={{ fontWeight: 600 }}>{ev.emoji || '🎬'} {ev.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{ev.genre}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{ev.venue}</td>
                    <td>₹{ev.price}</td>
                    <td>{ev.totalRows || 6} rows × {ev.seatsPerRow || 8} cols</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDeleteEvent(ev._id, ev.title)}
                        disabled={deleting === ev._id}
                      >
                        {deleting === ev._id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
