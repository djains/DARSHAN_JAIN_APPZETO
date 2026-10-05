import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Bookings.css';

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING:   'badge-warning',
  CANCELLED: 'badge-error',
  EXPIRED:   'badge-muted',
  FAILED:    'badge-error',
};

const TABS = ['All', 'CONFIRMED', 'PENDING', 'CANCELLED'];

export default function Bookings() {
  const { showToast }           = useToast();
  const [tab, setTab]           = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [ticket, setTicket]     = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Failed to load booking history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelling(bookingId);
      await api.post(`/bookings/${bookingId}/cancel`);
      showToast('Booking cancelled successfully! Seats released.', 'success');
      fetchBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      showToast('Failed to cancel booking.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = bookings.filter(b => tab === 'All' || b.status === tab);

  return (
    <div className="bookings-page">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <div className="bookings-header">
          <h1>🎫 My Movie Tickets</h1>
          <p>Real-time booking history & QR code tickets stored in database.</p>
        </div>

        {/* Tabs */}
        <div className="bookings-tabs">
          {TABS.map(t => (
            <button key={t} id={`booking-tab-${t.toLowerCase()}`}
              className={`bookings-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
            <h3>Loading Your Tickets from Database...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h3>No bookings found</h3>
            <p>You have no {tab !== 'All' ? tab.toLowerCase() : ''} movie bookings in database.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => {
              const eventTitle = b.eventId?.title || 'Movie Event';
              const eventEmoji = b.eventId?.emoji || '🎬';
              const venue = b.eventId?.venue || 'PVR Inox';
              const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div key={b._id} className="booking-item">
                  <div className="booking-item-emoji">{eventEmoji}</div>
                  <div className="booking-item-info">
                    <div className="booking-item-title">{eventTitle}</div>
                    <div className="booking-item-meta">
                      <span>🎭 {venue}</span>
                      <span>📅 {dateStr}</span>
                      <span>🕐 {b.showTime || '06:00 PM'}</span>
                    </div>
                    <div className="booking-item-seats">
                      {(b.seatLabels || []).map(s => <span key={s} className="booking-item-seat">{s}</span>)}
                    </div>
                  </div>
                  <div className="booking-item-right">
                    <span className={`badge ${STATUS_BADGE[b.status] || 'badge-muted'}`}>{b.status}</span>
                    <span className="booking-item-amount">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                    {b.status === 'CONFIRMED' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button id={`view-ticket-${b._id}`} className="btn btn-ghost btn-sm" onClick={() => setTicket(b)}>
                          🎟️ View Ticket
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancelling === b._id}
                        >
                          {cancelling === b._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket QR Modal */}
      {ticket && (
        <div className="ticket-overlay" onClick={() => setTicket(null)}>
          <div className="ticket-modal" onClick={e => e.stopPropagation()}>
            <button className="ticket-modal-close" onClick={() => setTicket(null)}>✕</button>
            <div style={{ fontSize: '36px', marginBottom: 6 }}>{ticket.eventId?.emoji || '🎬'}</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{ticket.eventId?.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>{ticket.eventId?.venue}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Show: {ticket.showTime} · Code: {ticket.ticketCode}</p>
            <div className="ticket-divider"><div className="ticket-divider-circle" /><div className="ticket-divider-line" /><div className="ticket-divider-circle" /></div>

            <div className="ticket-qr" style={{ padding: 12, background: '#fff', borderRadius: 12, display: 'inline-block' }}>
              {ticket.qrCode ? (
                <img src={ticket.qrCode} alt="Ticket QR Code" width="160" height="160" style={{ display: 'block' }} />
              ) : (
                <div style={{ color: '#000', fontSize: '0.8rem', width: 140, height: 140, display: 'grid', placeItems: 'center' }}>
                  VALID TICKET<br/>{ticket.ticketCode}
                </div>
              )}
            </div>

            <div className="ticket-code" style={{ marginTop: 8 }}>{ticket.ticketCode}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>
              Seats: {(ticket.seatLabels || []).join(', ')}
            </p>
            <button id="download-ticket" className="btn btn-primary btn-full" style={{ marginTop: 18 }} onClick={() => window.print()}>
              🖨️ Print / Save Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
