import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendEmailOTP } from '@/lib/otp';

export async function POST(req: Request) {
    try {
        const { email, method } = await req.json(); // method: 'email' | 'whatsapp'

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate and store OTP
        const otp = generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { email },
            data: {
                otpCode: otp,
                otpExpires: expires
            }
        });

        const result = await sendEmailOTP(email, otp);

        if (!result.success) {
            console.error("OTP Send Error:", result.error);
            return NextResponse.json({
                error: "Failed to send email. Please try again or check server logs."
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, isMock: result.mock });

    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
