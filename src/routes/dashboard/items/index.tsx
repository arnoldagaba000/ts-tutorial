/** biome-ignore-all lint/correctness/useImageSize: Already handled */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { CopyIcon, InboxIcon } from "lucide-react";
import { Suspense, use, useEffect, useState } from "react";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getItemsFn } from "@/data/items";
import { ItemStatus } from "@/generated/prisma/enums";
import { copyToClipboard } from "@/lib/clipboard";

const itemSearchSchema = z.object({
    q: z.string().default(""),
    status: z.union([z.literal("all"), z.enum(ItemStatus)]).default("all"),
});

export const Route = createFileRoute("/dashboard/items/")({
    component: RouteComponent,
    loader: () => ({ itemsPromise: getItemsFn() }),
    validateSearch: zodValidator(itemSearchSchema),
    head: () => ({
        meta: [
            { title: "Saved Items" },
            { property: "og:title", content: "Saved Items" },
        ],
    }),
});

type ItemsSearch = z.infer<typeof itemSearchSchema>;

function RouteComponent() {
    const { itemsPromise } = Route.useLoaderData();
    const { q, status } = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    const [searchInput, setSearchInput] = useState(q);

    useEffect(() => {
        if (searchInput === q) {
            return;
        }

        // Debounce the search
        const timeoutId = setTimeout(() => {
            navigate({ search: (prev) => ({ ...prev, q: searchInput }) });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchInput, navigate, q]);

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="font-bold text-2xl">Saved items</h1>
                <p className="text-muted-foreground">
                    Your saved articles and content!
                </p>
            </div>

            {/* Search and filter controls */}
            <div className="flex gap-4">
                <Input
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title or tags"
                    type="search"
                    value={searchInput}
                />

                <Select
                    onValueChange={(value) =>
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                status: value as typeof status,
                            }),
                        })
                    }
                    value={status}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(ItemStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0) +
                                    status.slice(1).toLowerCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Suspense fallback={<ItemsGridSkeleton />}>
                <ItemsList data={itemsPromise} q={q} status={status} />
            </Suspense>
        </div>
    );
}

function ItemsList({
    data,
    q,
    status,
}: {
    data: ReturnType<typeof getItemsFn>;
    q: ItemsSearch["q"];
    status: ItemsSearch["status"];
}) {
    const items = use(data);

    // Filter items based on search params
    const filteredItems = items.filter((item) => {
        // Filter by query
        const matchesQuery =
            q === "" ||
            item.title?.toLowerCase().includes(q.toLowerCase()) ||
            item.tags.some((tag) =>
                tag.toLowerCase().includes(q.toLowerCase())
            );

        // Filter by status
        const matchesStatus = status === "all" || item.status === status;
        return matchesQuery && matchesStatus;
    });

    if (filteredItems.length === 0) {
        return (
            <Empty className="h-full rounded-lg border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <InboxIcon className="size-12" />
                    </EmptyMedia>

                    <EmptyTitle>
                        {items.length === 0
                            ? "No items saved yet"
                            : "No items found"}
                    </EmptyTitle>

                    <EmptyDescription>
                        {items.length === 0
                            ? "Import a URL to get started with saving your content."
                            : "No items match your current search filters"}
                    </EmptyDescription>
                </EmptyHeader>

                {items.length === 0 && (
                    <EmptyContent>
                        <Link
                            className={buttonVariants()}
                            to="/dashboard/import"
                        >
                            Import URL
                        </Link>
                    </EmptyContent>
                )}
            </Empty>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {filteredItems.map((item) => (
                <Card
                    className="group overflow-hidden pt-0 transition-all hover:shadow-lg"
                    key={item.id}
                >
                    <Link
                        className="block"
                        params={{ itemId: item.id }}
                        to="/dashboard/items/$itemId"
                    >
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                            <img
                                alt={item.title ?? "Article thumbnail"}
                                className="h-full w-full object-cover group-hover:scale-105"
                                src={
                                    item.ogImage ??
                                    "https://marketplace.canva.com/EAD2962NKnQ/2/0/1600w/canva-rainbow-gradient-pink-and-purple-virtual-background-_Tcjok-d9b4.jpg"
                                }
                            />
                        </div>

                        <CardHeader className="space-y-3 pt-4">
                            <div className="flex items-center justify-between gap-2">
                                <Badge
                                    variant={
                                        item.status === "COMPLETED"
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {item.status.toLowerCase()}
                                </Badge>

                                <Button
                                    className="size-8"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        await copyToClipboard(item.url);
                                    }}
                                    size="icon"
                                    variant="outline"
                                >
                                    <CopyIcon className="size-4" />
                                </Button>
                            </div>

                            <CardTitle className="line-clamp-1 text-xl leading-snug transition-colors group-hover:text-primary">
                                {item.title}
                            </CardTitle>

                            {item.author && (
                                <p className="text-muted-foreground text-xs">
                                    {item.author}
                                </p>
                            )}

                            {item.summary && (
                                <CardDescription className="line-clamp-3 text-sm">
                                    {item.summary}
                                </CardDescription>
                            )}

                            {/* Tags */}
                            {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {item.tags.slice(0,4).map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardHeader>
                    </Link>
                </Card>
            ))}
        </div>
    );
}

function ItemsGridSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
                <Card className="overflow-hidden pt-0" key={item}>
                    <Skeleton className="aspect-video w-ful" />

                    <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="size-8 rounded-md" />
                        </div>

                        {/* Title */}
                        <Skeleton className="h-6 w-full" />

                        {/* Author */}
                        <Skeleton className="h-4 w-40" />
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
