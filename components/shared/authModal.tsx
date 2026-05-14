
"use client"

import { useEffect } from "react"
import { useAuthModal } from "@/store/auth-modal.store"
import { useSearchParams, useRouter } from "next/navigation"
import { useActionState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signUp, signIn } from "@/app/actions/auth.actions"
// import {signInWithEmail, signUpWithEmail} from "@/app/actions/auth.actions"


export function AuthModal() {
    const { isOpen, defaultTab, redirectTo, open, close } = useAuthModal()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [signInState, signInAction, signInPending] = useActionState(signIn, undefined)

    const [signUpState, signUpAction, signUpPending] = useActionState(signUp, undefined)

    const handleClose = () => {
        close()
        if (searchParams.get("aut") === "required") {
            router.replace("/")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
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