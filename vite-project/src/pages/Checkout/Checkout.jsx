import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import './Checkout.css';

const LOCK_DURATION = 10 * 60;

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [timeLeft, setTimeLeft]     = useState(LOCK_DURATION);
  const [processing, setProcessing] = useState(null);

  const eventId    = state?.eventId;
  const movieTitle = state?.movieTitle || 'Movie Ticket';
  const showtime   = state?.showtime   || '06:00 PM';
  const format     = state?.format     || '2D';
  const seatIds    = state?.seatIds    || [];
  const seatLabels = state?.seatLabels || [];
  const total      = state?.total      || 0;

  useEffect(() => {
    if (!eventId || seatIds.length === 0) {
      navigate('/');
    }
  }, [eventId, seatIds]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const expired = timeLeft <= 0;
  const isCritical = timeLeft < 120 && !expired;

  const handlePayment = async (scenario) => {
    try {
      setProcessing(scenario);

      // Step 1: Create PENDING booking in MongoDB
      const createRes = await api.post('/bookings', {
        eventId,
        seatIds,
        showTime: showtime
      });

      const bookingId = createRes.data.booking._id;

      // Step 2: Process payment scenario with backend MongoDB
      await api.post(`/bookings/${bookingId}/payment`, {
        paymentStatus: scenario === 'success' ? 'success' : 'failure'
      });

      if (scenario === 'success') {
        showToast('✅ Payment confirmed! Ticket generated in database.', 'success');
        setTimeout(() => navigate('/bookings'), 1200);
      } else {
        showToast('❌ Payment declined. Seats released.', 'error');
        setTimeout(() => navigate('/'), 1800);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const msg = err.response?.data?.error?.message || 'Payment processing failed';
      showToast(`⚠️ ${msg}`, 'error');
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ marginBottom: 6, fontSize: '1.6rem', fontWeight: 800 }}>🎬 Complete Your Booking</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Pay now to confirm your seats in database before the lock expires.</p>

        <div className="checkout-layout">
          {/* Order Summary */}
          <div>
            <h2 className="checkout-section-title">🎟️ Order Summary</h2>
            <div className="order-card">
              <div className="order-row">
                <span className="order-row-label">Movie</span>
                <span className="order-row-value">{movieTitle}</span>
              </div>
              <div className="order-row">
                <span className="order-row-label">Showtime</span>
                <span className="order-row-value">{showtime}</span>
              </div>
              <div className="order-row">
                <span className="order-row-label">Format</span>
                <span className="order-row-value"><span className="badge badge-info">{format}</span></span>
              </div>
              <div className="order-row">
                <span className="order-row-label">Selected Seats</span>
                <span style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {seatLabels.map(s => <span key={s} className="booking-seat-tag">{s}</span>)}
                </span>
              </div>
              <div className="order-row order-total-row">
                <span className="order-total-label">Total Payable</span>
                <span className="order-total-value">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="payment-card">
            <h2 className="checkout-section-title">💳 Payment Gateway</h2>
            <div className={`checkout-timer ${isCritical ? 'timer-critical' : ''}`}>
              ⏳ Lock timer: <span className="timer-count">{expired ? '00:00' : `${mins}:${secs}`}</span>
            </div>

            {expired ? (
              <div className="auth-alert error">⏱️ Your seat lock expired. Please select seats again.</div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
                  Mock Payment Gateway — test transaction result:
                </p>
                <div className="payment-scenarios">
                  {[
                    { id: 'success', label: '✅ Pay & Confirm Ticket', cls: 'success' },
                    { id: 'failure', label: '❌ Test Card Decline', cls: 'failure' },
                    { id: 'timeout', label: '⏱️ Test Gateway Timeout', cls: 'timeout' },
                  ].map(s => (
                    <button
                      key={s.id}
                      id={`pay-${s.id}`}
                      className={`payment-scenario-btn ${s.cls} ${processing === s.id ? 'processing' : ''}`}
                      onClick={() => handlePayment(s.id)}
                      disabled={!!processing}
                    >
                      {processing === s.id ? <><span className="spinner" /> Processing...</> : s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
