import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, role, name, ...otherData } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // If user exists but is NOT verified, allow re-registration (update password/details)
            if (!existingUser.emailVerified) {
                const hashedPassword = await bcrypt.hash(password, 10);

                const updatedUser = await prisma.user.update({
                    where: { email },
                    data: {
                        password: hashedPassword,
                        name,
                        role,
                        phoneNumber: otherData.phoneNumber,
                        // We don't update related profiles here to avoid complexity, 
                        // assuming they are either empty or can be updated later.
                    }
                });

                return NextResponse.json({ user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role } });
            }

            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                phoneNumber: otherData.phoneNumber, // Add phone number
                // Create related profile based on role
                ...(role === 'BRAND' && {
                    brand: {
                        create: {
                            companyName: otherData.companyName || name,
                            website: otherData.website
                        }
                    }
                }),
                ...(role === 'CREATOR' && {
                    creator: {
                        create: {
                            // Initialize empty creator profile
                        }
                    }
                })
            }
        });

        return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
