"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendResetLink } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [state, action, pending] = useActionState(sendResetLink, { error: null, success: false });

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 bg-white p-8 border border-gray-100 rounded-lg shadow-sm">

                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-sm text-gray-500">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {state?.success ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex flex-col items-center text-center space-y-2">
                        <CheckCircle2 size={32} className="text-green-500" />
                        <p className="font-medium">Check your email</p>
                        <p className="text-sm">We've sent a secure recovery link to your inbox.</p>
                    </div>
                ) : (
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                        </div>

                        {state?.error && (
                            <p className="text-sm text-red-500 font-medium">{state.error}</p>
                        )}

                        <Button type="submit" className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white" disabled={pending}>
                            {pending ? "Sending Link..." : "Send Reset Link"}
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-[#FF5A00] transition-colors">
                        <ArrowLeft size={14} className="mr-2" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}