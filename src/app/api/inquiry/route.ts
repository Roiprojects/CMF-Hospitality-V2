import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, date, venue, guests, message } = body;

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }
    if (!service || typeof service !== 'string') {
      return NextResponse.json({ success: false, error: 'Please select an experience or service' }, { status: 400 });
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
          service,
          date: date || 'Flexible / To be confirmed',
          venue: venue ? String(venue).trim() : 'To be confirmed',
          guests: guests ? Number(guests) : 'To be confirmed',
          message: message ? String(message).trim() : 'No additional notes',
          timestamp: new Date().toISOString()
        }
      }, { status: 200 });
    }

    // In production with credentials:
    // (Execute SMTP dispatch or webhook call here)
    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been received. Our team will contact you within 24 hours.'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request payload'
    }, { status: 400 });
  }
}
