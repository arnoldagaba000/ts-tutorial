/** biome-ignore-all lint/correctness/useImageSize: Already configured */
/** biome-ignore-all lint/style/noNestedTernary: For simplicity */

import { Link } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "../ui/button";
import { ThemeToggle } from "./theme-toggler";

const Navbar = () => {
    const { data: session, isPending } = authClient.useSession();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logged out successfully");
                },
                onError: ({ error }) => {
                    toast.error(error.message);
                }
            },
        });
    };

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <img
                        alt="Tanstack Start logo"
                        className="size-9"
                        src="https://tanstack.com/images/logos/logo-color-banner-600.png"
                    />

                    <h1 className="font-semibold text-lg">Tanstack Start</h1>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {isPending ? null : session ? (
                        <>
                            <Button onClick={handleSignOut} variant="secondary">Log out</Button>
                            <Link className={buttonVariants()} to="/dashboard">
                                Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                className={buttonVariants({
                                    variant: "secondary",
                                })}
                                to="/login"
                            >
                                Login
                            </Link>
                            <Link className={buttonVariants()} to="/signup">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
