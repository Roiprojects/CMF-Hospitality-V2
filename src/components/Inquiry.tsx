'use client';

import { useEffect, useState } from 'react';
import data from '@/content/data.json';

interface InquiryState {
  status: 'idle' | 'submitting' | 'success' | 'setup_required' | 'error';
  message: string;
  briefText?: string;
}

export default function Inquiry() {
  const [service, setService] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guests, setGuests] = useState('');
  const [message, setMessage] = useState('');

  const [state, setState] = useState<InquiryState>({
    status: 'idle',
    message: ''
  });

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('service');
    if (s) setService(s);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: 'submitting', message: 'Validating and submitting your inquiry...' });

    const payload = {
      name,
      email,
      phone,
      service,
      date,
      venue,
      guests,
      message
    };

    const formattedBrief = [
      '==========================================',
      'BAR CHEF BENGALURU — EVENT BRIEF',
      '==========================================',
      `Guest Name:    ${name}`,
      `Email:         ${email}`,
      `Phone:         ${phone || 'Not specified'}`,
      `Experience:    ${data.services.find(s => s.slug === service)?.title || service}`,
      `Event Date:    ${date || 'Flexible'}`,
      `Venue/City:    ${venue || 'Bengaluru'}`,
      `Guest Count:   ${guests || 'To be confirmed'}`,
      `Ideas/Notes:   ${message || 'No additional notes'}`,
      `Submitted:     ${new Date().toLocaleString()}`,
      '=========================================='
    ].join('\n');

    try {
      const res = await fetch('/api/inquiry/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setState({
          status: 'success',
          message: result.message || 'Your inquiry has been successfully received!'
        });
      } else if (result.setupRequired) {
        setState({
          status: 'setup_required',
          message: result.message,
          briefText: formattedBrief
        });
      } else {
        setState({
          status: 'error',
          message: result.error || 'There was an issue processing your submission.'
        });
      }
    } catch {
      // Offline or network error fallback
      setState({
        status: 'setup_required',
        message: 'Direct server transmission unavailable. Your brief has been prepared for local download or direct WhatsApp transfer.',
        briefText: formattedBrief
      });
    }
  };

  const handleDownload = () => {
    if (!state.briefText) return;
    const blob = new Blob([state.briefText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bar-chef-brief-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'event'}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const whatsappUrl = `https://wa.me/919945379333?text=${encodeURIComponent(
    `Hello BarChef Bengaluru,\n\nI would like to plan a bar experience:\n- Name: ${name}\n- Experience: ${service}\n- Date: ${date || 'TBD'}\n- Guests: ${guests || 'TBD'}\n- Venue: ${venue || 'Bengaluru'}\n\nNotes: ${message}`
  )}`;

  return (
    <div className="inquiry">
      <div>
        <p className="eyebrow">TELL US A LITTLE ABOUT IT</p>
        <h2>
          Every great experience
          <br />
          starts with <em>a conversation.</em>
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
          Share your plans, date, venue, guest count, and the atmosphere you have in mind.
          Whether hosting an intimate rooftop gathering in Bengaluru or a multi-day destination wedding, our team is ready to curate your bar.
        </p>

        {/* Verified Business Contact Information */}
        <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '24px 20px', marginBottom: '28px' }}>
          <h4 style={{ margin: '0 0 14px', fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-primary)' }}>
            Verified Contact & Hospitality Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--deep-bronze)' }}>Founders: </strong>
              <span>Monish Raj D A & Bharath Venkatesh</span>
            </div>
            <div>
              <strong style={{ color: 'var(--deep-bronze)' }}>Phone / WhatsApp: </strong>
              <a href="tel:+919945379333" className="text-link" style={{ marginLeft: '4px' }}>
                +91 99453 79333
              </a>
            </div>
            <div>
              <strong style={{ color: 'var(--deep-bronze)' }}>Service Hub: </strong>
              <span>Bengaluru, Karnataka (Available for destination travel)</span>
            </div>
            <div>
              <strong style={{ color: 'var(--deep-bronze)' }}>Directions / Location: </strong>
              <a
                href="https://share.google/Jat8wcj5yzHFEXLfV"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
                style={{ marginLeft: '4px' }}
              >
                Directions (View location ↗)
              </a>
            </div>
            <div>
              <strong style={{ color: 'var(--deep-bronze)' }}>Instagram: </strong>
              <span style={{ marginLeft: '4px' }}>
                <a
                  href="https://www.instagram.com/barchefbengaluru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  @barchefbengaluru ↗
                </a>
                {' · '}
                <a
                  href="https://www.instagram.com/pure_fruit_fresh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  @pure_fruit_fresh ↗
                </a>
              </span>
            </div>
          </div>
        </div>

        <p className="note">
          All client submissions are validated and processed securely. Server delivery credentials remain strictly server-side.
        </p>
      </div>

      <form className="inquiry-form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <label>
            Your name *
            <input
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
            />
          </label>
          <label>
            Email address *
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikram@example.com"
            />
          </label>
          <label>
            Phone number (WhatsApp)
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </label>
          <label>
            Experience *
            <select
              name="service"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">Select an experience</option>
              {data.services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Event date
            <input
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Estimated guest count
            <input
              name="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="e.g. 75"
            />
          </label>
        </div>

        <label style={{ display: 'block', marginTop: '14px' }}>
          City / Venue
          <input
            name="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Indiranagar, Bengaluru or Udaipur"
          />
        </label>

        <label style={{ display: 'block', marginTop: '14px' }}>
          Tell us about your celebration or requirements
          <textarea
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Favourite spirits, signature flavours, event timeline, theme or operational expectations..."
          />
        </label>

        <button
          className="button full-width"
          type="submit"
          disabled={state.status === 'submitting'}
          style={{ marginTop: '18px' }}
        >
          {state.status === 'submitting' ? 'Validating & Submitting...' : 'Submit Event Enquiry ↗'}
        </button>

        {/* Server Success State */}
        {state.status === 'success' && (
          <div
            role="status"
            style={{
              marginTop: '18px',
              padding: '16px 20px',
              backgroundColor: '#EBF7EE',
              border: '1px solid #B0E0BA',
              borderRadius: 'var(--radius-sm)',
              color: '#1E6B32',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            <strong>✓ Enquiry Transmitted:</strong> {state.message}
          </div>
        )}

        {/* Server Setup Required (Delivery credentials unconfigured) */}
        {state.status === 'setup_required' && (
          <div
            role="status"
            style={{
              marginTop: '18px',
              padding: '18px 20px',
              backgroundColor: 'var(--bg-cream)',
              border: '1px solid var(--line-gold)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: 'var(--deep-bronze)', fontWeight: 600 }}>
              ⚙️ Server Setup Notice:
            </p>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
              {state.message}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                className="button small"
                onClick={handleDownload}
              >
                Download My Brief (.txt) ↓
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button small"
                style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#FFFFFF' }}
              >
                Send via WhatsApp ↗
              </a>
            </div>
          </div>
        )}

        {/* Validation Error State */}
        {state.status === 'error' && (
          <div
            role="alert"
            style={{
              marginTop: '18px',
              padding: '14px 18px',
              backgroundColor: '#FDF2F2',
              border: '1px solid #F8B4B4',
              borderRadius: 'var(--radius-sm)',
              color: '#9B1C1C',
              fontSize: '13.5px'
            }}
          >
            <strong>Please check your form:</strong> {state.message}
          </div>
        )}
      </form>
    </div>
  );
}
