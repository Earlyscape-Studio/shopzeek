"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdatePasswordPage() {
    const [state, action, pending] = useActionState(updatePassword, { error: "" });

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 bg-white p-8 border border-gray-100 rounded-lg shadow-sm">

                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                    <p className="text-sm text-gray-500">
                        Please enter your new password below.
                    </p>
                </div>

                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-500 font-medium">{state.error}</p>
                    )}

                    <Button type="submit" className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white" disabled={pending}>
                        {pending ? "Updating..." : "Update Password"}
                    </Button>
                </form>

            </div>
        </div>
    );
}