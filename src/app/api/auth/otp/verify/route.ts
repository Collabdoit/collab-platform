import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPhoneOTP } from '@/lib/otp';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let isValid = false;

        // Check if user has a phone number and if we should try verifying via Twilio
        // Note: Ideally the frontend should tell us which method was used.
        // For now, if the user has a phone number, we try Twilio first, then DB.
        // Or better: check if DB has a valid code. If not, try Twilio.

        if (user.otpCode && user.otpExpires && new Date() < user.otpExpires && user.otpCode === code) {
            isValid = true;
        } else if (user.phoneNumber) {
            // Try Twilio Verify
            const twilioResult = await verifyPhoneOTP(user.phoneNumber, code);
            if (twilioResult.success) {
                isValid = true;
            }
        }

        if (!isValid) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Verify User
        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
                otpCode: null,
                otpExpires: null
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
