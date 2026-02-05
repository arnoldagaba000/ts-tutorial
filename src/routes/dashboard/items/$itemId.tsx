/** biome-ignore-all lint/correctness/useImageSize: Already handled */

import { useCompletion } from "@ai-sdk/react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
    ArrowLeftIcon,
    CalendarIcon,
    ChevronDownIcon,
    ClockIcon,
    ExternalLinkIcon,
    SparklesIcon,
    UserIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MessageResponse } from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { getItemById, saveSummaryAndGenerateTagsFn } from "@/data/items";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/items/$itemId")({
    component: RouteComponent,
    loader: ({ params }) => getItemById({ data: { id: params.itemId } }),
    head: ({ loaderData }) => ({
        meta: [
            { title: loaderData?.title ?? "Item details" },
            {
                property: "og:title",
                content: loaderData?.ogImage ?? "Item details",
            },
            {
                name: "twitter:title",
                content: loaderData?.ogImage ?? "Item details",
            },
        ],
    }),
});

function RouteComponent() {
    const data = Route.useLoaderData();
    const router = useRouter();

    const [contentOpen, setContentOpen] = useState(false);

    const { complete, completion, isLoading } = useCompletion({
        api: "/api/ai/summary",
        initialCompletion: data.summary ? data.summary : undefined,
        streamProtocol: "text",
        body: { itemId: data.id },
        onFinish: async (_prompt, completionText) => {
            await saveSummaryAndGenerateTagsFn({
                data: { id: data.id, summary: completionText },
            });

            toast.success("Summary generated successfully");
            router.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleGenerateSummary = () => {
        if (!data.content) {
            toast.error("No content available to summarize");
            return;
        }

        complete(data.content);
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <div className="flex justify-start">
                <Link
                    className={buttonVariants({
                        variant: "outline",
                    })}
                    to="/dashboard/items"
                >
                    <ArrowLeftIcon /> Go back
                </Link>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img
                    alt={data.title ?? "Item image"}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    src={
                        data.ogImage ??
                        "https://marketplace.canva.com/EAD2962NKnQ/2/0/1600w/canva-rainbow-gradient-pink-and-purple-virtual-background-_Tcjok-d9b4.jpg"
                    }
                />
            </div>

            <div className="space-y-3">
                <h1 className="font-bold text-3xl tracking-tight">
                    {data.title ?? "Untitled"}
                </h1>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                    {data.author && (
                        <span className="inline-flex items-center gap-1">
                            <UserIcon className="size-3.5" />
                            {data.author}
                        </span>
                    )}

                    {data.publishedAt && (
                        <span className="inline-flex items-center gap-1">
                            <CalendarIcon className="size-3.5" />{" "}
                            {new Date(data.publishedAt).toLocaleDateString(
                                "en-US"
                            )}
                        </span>
                    )}

                    <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-3.5" /> Saved{" "}
                        {new Date(data.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>

                <a
                    className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                    href={data.url}
                    target="_blank"
                >
                    View original <ExternalLinkIcon className="size-3.5" />
                </a>

                {/* Tags */}
                {data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                        ))}
                    </div>
                )}

                {/* Summary Section */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="mb-3 font-semibold text-primary text-sm uppercase tracking-wide">
                                    Summary
                                </h2>

                                {completion || data.summary ? (
                                    <MessageResponse>
                                        {completion}
                                    </MessageResponse>
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        {data.content
                                            ? "No summary yet. Generate one with AI."
                                            : "No content available to summarise"}
                                    </p>
                                )}
                            </div>

                            {data.content && !data.summary && (
                                <Button
                                    className="cursor-pointer"
                                    disabled={isLoading}
                                    onClick={handleGenerateSummary}
                                    size="sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner className="size-4" />{" "}
                                            Generating ...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="size-4" />{" "}
                                            Generate
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Section */}
                {data.content && (
                    <Collapsible
                        onOpenChange={setContentOpen}
                        open={contentOpen}
                    >
                        <CollapsibleTrigger
                            render={
                                <Button
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <span className="font-medium">
                                        Full content
                                    </span>
                                    <ChevronDownIcon
                                        className={cn(
                                            contentOpen ? "rotate-180" : "",
                                            "size-4 transition-transform duration-200"
                                        )}
                                    />
                                </Button>
                            }
                        />

                        <CollapsibleContent>
                            <Card className="mt-2">
                                <CardContent>
                                    <MessageResponse>
                                        {data.content}
                                    </MessageResponse>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
        </div>
    );
}
