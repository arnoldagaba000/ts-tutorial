import { createClientOnlyFn } from "@tanstack/react-start";
import { toast } from "react-hot-toast";

export const copyToClipboard = createClientOnlyFn(async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");

    return;
});
