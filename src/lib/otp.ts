import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize clients
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export async function sendEmailOTP(email: string, code: string) {
    if (!resend) {
        console.log(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
        return { success: true, mock: true };
    }

    try {
        await resend.emails.send({
            from: 'Collab <onboarding@resend.dev>', // Update this with your verified domain later
            to: email,
            subject: 'Your Verification Code',
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`
        });
        return { success: true };
    } catch (error) {
        console.error('Resend Error:', error);
        return { success: false, error };
    }
}

export async function sendWhatsAppOTP(phone: string, code: string) {
    if (!twilioClient || !process.env.TWILIO_FROM_NUMBER) {
        console.log(`[MOCK WHATSAPP] To: ${phone}, Code: ${code}`);
        return { success: true, mock: true };
    }

    try {
        await twilioClient.messages.create({
            body: `Your Collab verification code is: ${code}`,
            from: `whatsapp:${process.env.TWILIO_FROM_NUMBER}`,
            to: `whatsapp:${phone}`
        });
        return { success: true };
    } catch (error) {
        console.error('Twilio Error:', error);
        return { success: false, error };
    }
}

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
