import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_bV1hQkE8_Htt4TAqth1PDUgZDQXiMeLFE');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, agentCount, useCase, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Hickup Intake <onboarding@resend.dev>',
      to: ['clarkkitchen22@gmail.com'],
      subject: `New Agent Infrastructure Inquiry from ${name}`,
      html: `
        <h2>New Intake Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Current Agent Count:</strong> ${agentCount || 'Not provided'}</p>
        <p><strong>Primary Use Case:</strong> ${useCase || 'Not provided'}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
