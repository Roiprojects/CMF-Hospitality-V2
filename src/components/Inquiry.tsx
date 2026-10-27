'use client';

import { useEffect, useState, useMemo } from 'react';
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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [state, setState] = useState<InquiryState>({
    status: 'idle',
    message: ''
  });

  // Calculate today's date in YYYY-MM-DD for date input min constraint
  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('service');
    if (s) setService(s);
  }, []);

  // Validation function per field
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) return 'Please provide your full name.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        if (trimmed.length > 100) return 'Name cannot exceed 100 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
          return 'Name may only contain letters, spaces, hyphens, and apostrophes.';
        }
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'Please provide your email address.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmed)) {
          return 'Please enter a valid email address (e.g. name@domain.com).';
        }
        return '';
      }
      case 'service': {
        if (!value.trim()) return 'Please select an experience or celebration category.';
        return '';
      }
      case 'phone': {
        const trimmed = value.trim();
        if (trimmed) {
          const phoneRegex = /^(\+?[0-9\s-]{10,18})$/;
          if (!phoneRegex.test(trimmed)) {
            return 'Please provide a valid 10–15 digit phone or WhatsApp number.';
          }
        }
        return '';
      }
      case 'date': {
        if (value) {
          const selected = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selected < today) {
            return 'Event date cannot be in the past.';
          }
        }
        return '';
      }
      case 'guests': {
        if (value) {
          const num = Number(value);
          if (isNaN(num) || !Number.isInteger(num) || num < 1) {
            return 'Please enter a positive whole number for guests.';
          }
          if (num > 50000) {
            return 'Guest count exceeds standard capacity (max 50,000).';
          }
        }
        return '';
      }
      case 'message': {
        if (value.length > 2000) {
          return 'Notes cannot exceed 2,000 characters.';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (field: string, val: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors(prev => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, val: string, setter: (v: string) => void) => {
    setter(val);
    if (touched[field]) {
      const err = validateField(field, val);
      setErrors(prev => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  const validateAll = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const checks: [string, string][] = [
      ['name', name],
      ['email', email],
      ['service', service],
      ['phone', phone],
      ['date', date],
      ['guests', guests],
      ['message', message]
    ];

    checks.forEach(([f, v]) => {
      const err = validateField(f, v);
      if (err) newErrors[f] = err;
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      service: true,
      phone: true,
      date: true,
      venue: true,
      guests: true,
      message: true
    });

    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setState({
        status: 'error',
        message: 'Please resolve the highlighted fields before submitting.'
      });
      // Focus first erroneous input element
      const firstKey = Object.keys(validationErrors)[0];
      const targetEl = document.querySelector(`[name="${firstKey}"]`) as HTMLElement;
      targetEl?.focus();
      return;
    }

    setState({ status: 'submitting', message: 'Validating and submitting your inquiry...' });

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service: service.trim(),
      date,
      venue: venue.trim(),
      guests: guests ? Number(guests) : undefined,
      message: message.trim()
    };

    const formattedBrief = [
      '==========================================',
      'BAR CHEF BENGALURU — EVENT BRIEF',
      '==========================================',
      `Guest Name:    ${name.trim()}`,
      `Email:         ${email.trim()}`,
      `Phone:         ${phone.trim() || 'Not specified'}`,
      `Experience:    ${data.services.find(s => s.slug === service)?.title || service}`,
      `Event Date:    ${date || 'Flexible'}`,
      `Venue/City:    ${venue.trim() || 'Bengaluru'}`,
      `Guest Count:   ${guests || 'To be confirmed'}`,
      `Ideas/Notes:   ${message.trim() || 'No additional notes'}`,
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
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        setState({
          status: 'error',
          message: result.error || 'Server validation failed. Please check the marked fields.'
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
          {/* 1. Name */}
          <div>
            <label htmlFor="inquiry-name">
              Your name *
            </label>
            <input
              id="inquiry-name"
              name="name"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={Boolean(touched.name && errors.name)}
              aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
              value={name}
              onChange={(e) => handleChange('name', e.target.value, setName)}
              onBlur={(e) => handleBlur('name', e.target.value)}
              placeholder="e.g. Vikram Sharma"
            />
            {touched.name && errors.name && (
              <span id="name-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.name}
              </span>
            )}
          </div>

          {/* 2. Email */}
          <div>
            <label htmlFor="inquiry-email">
              Email address *
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              value={email}
              onChange={(e) => handleChange('email', e.target.value, setEmail)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="e.g. vikram@example.com"
            />
            {touched.email && errors.email && (
              <span id="email-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.email}
              </span>
            )}
          </div>

          {/* 3. Phone */}
          <div>
            <label htmlFor="inquiry-phone">
              Phone number (WhatsApp)
            </label>
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(touched.phone && errors.phone)}
              aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
              value={phone}
              onChange={(e) => handleChange('phone', e.target.value, setPhone)}
              onBlur={(e) => handleBlur('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
            {touched.phone && errors.phone && (
              <span id="phone-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.phone}
              </span>
            )}
          </div>

          {/* 4. Experience / Service */}
          <div>
            <label htmlFor="inquiry-service">
              Experience *
            </label>
            <select
              id="inquiry-service"
              name="service"
              required
              aria-required="true"
              aria-invalid={Boolean(touched.service && errors.service)}
              aria-describedby={touched.service && errors.service ? 'service-error' : undefined}
              value={service}
              onChange={(e) => handleChange('service', e.target.value, setService)}
              onBlur={(e) => handleBlur('service', e.target.value)}
            >
              <option value="">Select an experience</option>
              {data.services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
            {touched.service && errors.service && (
              <span id="service-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.service}
              </span>
            )}
          </div>

          {/* 5. Date */}
          <div>
            <label htmlFor="inquiry-date">
              Event date
            </label>
            <input
              id="inquiry-date"
              name="date"
              type="date"
              min={todayStr}
              aria-invalid={Boolean(touched.date && errors.date)}
              aria-describedby={touched.date && errors.date ? 'date-error' : undefined}
              value={date}
              onChange={(e) => handleChange('date', e.target.value, setDate)}
              onBlur={(e) => handleBlur('date', e.target.value)}
            />
            {touched.date && errors.date && (
              <span id="date-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.date}
              </span>
            )}
          </div>

          {/* 6. Guests */}
          <div>
            <label htmlFor="inquiry-guests">
              Estimated guest count
            </label>
            <input
              id="inquiry-guests"
              name="guests"
              type="number"
              min="1"
              max="50000"
              aria-invalid={Boolean(touched.guests && errors.guests)}
              aria-describedby={touched.guests && errors.guests ? 'guests-error' : undefined}
              value={guests}
              onChange={(e) => handleChange('guests', e.target.value, setGuests)}
              onBlur={(e) => handleBlur('guests', e.target.value)}
              placeholder="e.g. 75"
            />
            {touched.guests && errors.guests && (
              <span id="guests-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.guests}
              </span>
            )}
          </div>
        </div>

        {/* 7. City / Venue */}
        <div style={{ marginTop: '16px' }}>
          <label htmlFor="inquiry-venue">
            City / Venue
          </label>
          <input
            id="inquiry-venue"
            name="venue"
            maxLength={200}
            value={venue}
            onChange={(e) => handleChange('venue', e.target.value, setVenue)}
            placeholder="e.g. Indiranagar, Bengaluru or Udaipur"
          />
        </div>

        {/* 8. Message / Notes */}
        <div style={{ marginTop: '16px' }}>
          <label htmlFor="inquiry-message">
            Tell us about your celebration or requirements
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={4}
            maxLength={2000}
            aria-invalid={Boolean(touched.message && errors.message)}
            aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
            value={message}
            onChange={(e) => handleChange('message', e.target.value, setMessage)}
            onBlur={(e) => handleBlur('message', e.target.value)}
            placeholder="Favourite spirits, signature flavours, event timeline, theme or operational expectations..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {touched.message && errors.message ? (
              <span id="message-error" className="form-field-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm0 8a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                </svg>
                {errors.message}
              </span>
            ) : <span />}
            <span className="form-char-count">{message.length}/2000</span>
          </div>
        </div>

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
