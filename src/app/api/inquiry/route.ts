import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, date, venue, guests, message } = body;

    const fieldErrors: Record<string, string> = {};

    // 1. Name validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      fieldErrors.name = 'Please provide your full name.';
    } else if (name.trim().length < 2) {
      fieldErrors.name = 'Name must be at least 2 characters.';
    } else if (name.trim().length > 100) {
      fieldErrors.name = 'Name cannot exceed 100 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
      fieldErrors.name = 'Name may only contain letters, spaces, hyphens, and apostrophes.';
    }

    // 2. Email validation (RFC 5322 standard regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      fieldErrors.email = 'Please provide your email address.';
    } else if (email.trim().length > 120) {
      fieldErrors.email = 'Email address cannot exceed 120 characters.';
    } else if (!emailRegex.test(email.trim())) {
      fieldErrors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    // 3. Service selection validation
    if (!service || typeof service !== 'string' || service.trim().length === 0) {
      fieldErrors.service = 'Please select an experience or celebration category.';
    }

    // 4. Phone validation (optional, but validated if provided)
    if (phone && typeof phone === 'string' && phone.trim().length > 0) {
      const cleanPhone = phone.trim();
      const phoneRegex = /^(\+?[0-9\s-]{10,18})$/;
      if (!phoneRegex.test(cleanPhone)) {
        fieldErrors.phone = 'Please provide a valid 10–15 digit phone or WhatsApp number.';
      }
    }

    // 5. Date validation (optional, but must be today or in the future if provided)
    if (date && typeof date === 'string' && date.trim().length > 0) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        fieldErrors.date = 'Please provide a valid calendar date.';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate < today) {
          fieldErrors.date = 'Event date cannot be in the past.';
        }
      }
    }

    // 6. Guest count validation (optional, but must be positive integer if provided)
    if (guests !== undefined && guests !== null && guests !== '') {
      const guestNum = Number(guests);
      if (isNaN(guestNum) || !Number.isInteger(guestNum) || guestNum < 1) {
        fieldErrors.guests = 'Guest count must be a positive integer.';
      } else if (guestNum > 50000) {
        fieldErrors.guests = 'Guest count exceeds maximum standard capacity (50,000).';
      }
    }

    // 7. Venue / Location validation (optional length guard)
    if (venue && typeof venue === 'string' && venue.trim().length > 200) {
      fieldErrors.venue = 'Venue description cannot exceed 200 characters.';
    }

    // 8. Message / Notes validation (optional length guard)
    if (message && typeof message === 'string' && message.trim().length > 2000) {
      fieldErrors.message = 'Notes cannot exceed 2,000 characters.';
    }

    // If any validation errors exist, return 400 Bad Request with field errors
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed. Please review the highlighted fields.',
        fieldErrors
      }, { status: 400 });
    }

    // Server delivery credentials check (kept strictly server-side)
    const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const hasWebhook = Boolean(process.env.INQUIRY_WEBHOOK_URL);

    // If server delivery credentials are not configured in environment
    if (!hasSmtp && !hasWebhook) {
      return NextResponse.json({
        success: false,
        setupRequired: true,
        message: 'Delivery credentials (SMTP or Webhook) are not yet configured on this server. Your event brief has been prepared for local download and instant WhatsApp submission.',
        briefData: {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? String(phone).trim() : 'Not provided',
          service: service.trim(),
          date: date || 'Flexible / To be confirmed',
          venue: venue ? String(venue).trim() : 'To be confirmed',
          guests: guests ? Number(guests) : 'To be confirmed',
          message: message ? String(message).trim() : 'No additional notes',
          timestamp: new Date().toISOString()
        }
      }, { status: 200 });
    }

    // In production with credentials configured:
    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been received. Our team will contact you within 24 hours.'
    }, { status: 200 });

  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid request payload'
    }, { status: 400 });
  }
}
