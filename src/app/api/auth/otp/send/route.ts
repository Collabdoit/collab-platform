import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendEmailOTP, sendWhatsAppOTP } from '@/lib/otp';

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

        const otp = generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to DB
        await prisma.user.update({
            where: { email },
            data: {
                otpCode: otp,
                otpExpires: expires
            }
        });

        // Send OTP
        if (method === 'whatsapp' && user.phoneNumber) {
            await sendWhatsAppOTP(user.phoneNumber, otp);
        } else {
            await sendEmailOTP(email, otp);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
