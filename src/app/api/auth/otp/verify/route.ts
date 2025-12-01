import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        if (!user.otpCode || !user.otpExpires) {
            return NextResponse.json({ error: "No OTP request found" }, { status: 400 });
        }

        if (new Date() > user.otpExpires) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        if (user.otpCode !== code) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
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
