import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize clients
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Twilio Config
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
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

export async function sendPhoneOTP(phone: string, channel: 'sms' | 'whatsapp' = 'sms') {
    if (!twilioClient) {
        console.log(`[MOCK PHONE] To: ${phone}, Channel: ${channel} (Twilio credentials missing)`);
        return { success: true, mock: true };
    }

    try {
        await twilioClient.verify.v2.services(TWILIO_SERVICE_SID)
            .verifications
            .create({ to: phone, channel });
        return { success: true };
    } catch (error) {
        console.error('Twilio Verify Error:', error);
        return { success: false, error };
    }
}

export async function verifyPhoneOTP(phone: string, code: string) {
    if (!twilioClient) {
        // In mock mode, we can't really verify without storage, so we assume 123456 for testing
        if (code === '123456') return { success: true, mock: true };
        return { success: false, error: 'Mock verification failed' };
    }

    try {
        const verification = await twilioClient.verify.v2.services(TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: phone, code });

        if (verification.status === 'approved') {
            return { success: true };
        } else {
            return { success: false, error: 'Invalid code' };
        }
    } catch (error) {
        console.error('Twilio Verify Check Error:', error);
        return { success: false, error };
    }
}

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
