
"use client"

import { useEffect, useState, useActionState } from "react"
import { useAuthModal } from "@/store/auth-modal.store"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signUp, signIn } from "@/app/actions/auth.actions"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { sendWelcomeEmail } from "@/app/actions/email.actions"
import {toast} from "sonner"
// import {signInWithEmail, signUpWithEmail} from "@/app/actions/auth.actions"


export function AuthModal() {
    const { isOpen, defaultTab, redirectTo, open, close } = useAuthModal()
    const searchParams = useSearchParams()
    const router = useRouter()
    // const [showSuccess, setShowSuccess] = useState(false)

    const [signInState, signInAction, signInPending] = useActionState(signIn, {error: "", success: false})

    const [signUpState, signUpAction, signUpPending] = useActionState(signUp, {error: "", success: false})

    useEffect(() => {
        const userData = signUpState?.data

        if (signUpState?.success && userData) {
            const syncAndClose = async () => {
                const supabase = createClient();
                // 1. Force the browser client to read the new server cookie
                await supabase.auth.getUser(); 
                
                // 2. Fire the UI updates
                toast.success("Account created successfully!");
                router.refresh();
                close();

                sendWelcomeEmail(
                    userData.email,
                    userData.firstName
                ).catch(err => console.error("Failed to trigger welcome email", err))
            };
            syncAndClose()
        }

        if (signInState?.success) {
            const syncAndClose = async () => {
                const supabase = createClient();
                // 1. Force the browser client to read the new server cookie
                await supabase.auth.getUser(); 
                
                // 2. Fire the UI updates
                toast.success("Welcome back! You are signed in.");
                router.refresh();
                close();
            };

            syncAndClose()
        }
    }, [signInState?.success, signUpState?.success,signUpState?.data, close, router]);

    const handleClose = () => {
        close()
        if (searchParams.get("aut") === "required") {
            router.replace("/")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden py-8 px-5 flex flex-col items-center justify-between">

                <DialogTitle className="sr-only">Authentication</DialogTitle>
                <DialogDescription className="sr-only">
                    Sign in or create an account to continue.
                </DialogDescription>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="w-full rounded-none border-b h-12 bg-white">
                        <TabsTrigger
                            value="signin"
                            className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500"
                        >
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger
                            value="signup"
                            className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500"
                        >
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    {/* Sign In */}
                    <TabsContent value="signin" className="p-6 space-y-4">
                        <form action={signInAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email">Email Address</Label>
                                <Input id="signin-email" name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="signin-password">Password</Label>
                                    <button
                                        type="button"
                                        className="text-sm text-orange-500 hover:underline"
                                    >
                                        Forgot Password
                                    </button>
                                </div>
                                <Input
                                    id="signin-password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </div>
                            {signInState?.error && (
                                <p className="text-sm text-red-500">{signInState.error}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600"
                                disabled={signInPending}
                            >
                                {signInPending ? "Signing in..." : "SIGN IN →"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Sign Up */}
                    <TabsContent value="signup" className="p-6 space-y-4">
                        <form action={signUpAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name">Name</Label>
                                <Input id="signup-name" name="full_name" type="text" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email Address</Label>
                                <Input id="signup-email" name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    placeholder="at least 8 characters"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-confirm">Confirm Password</Label>
                                <Input
                                    id="signup-confirm"
                                    name="confirm_password"
                                    type="password"
                                    required
                                />
                            </div>
                            {signUpState?.error && (
                                <p className="text-sm text-red-500">{signUpState.error}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600"
                                disabled={signUpPending}
                            >
                                {signUpPending ? "Creating account..." : "SIGN UP →"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}