import { Resend } from 'resend';

// Initialize clients
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
