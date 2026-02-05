/** biome-ignore-all lint/a11y/noLabelWithoutControl: Ignore */

import type { SearchResultWeb } from "@mendable/firecrawl-js";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
    type BulkScrapeProgress,
    bulkScrapeUrlsFn,
    searchWebFn,
} from "@/data/items";
import { searchSchema } from "@/schemas/import";

export const Route = createFileRoute("/dashboard/discover")({
    component: RouteComponent,
    head: () => ({
        meta: [
            { title: "Discover" },
            {
                name: "description",
                content:
                    "Search the web for articles on any topic and import interesting content to your library.",
            },
            { property: "og:title", content: "Discover" },
            {
                property: "og:description",
                content:
                    "Search the web for articles on any topic and import interesting content to your library.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary" },
            { name: "twitter:title", content: "Discover" },
            {
                name: "twitter:description",
                content:
                    "Search the web for articles on any topic and import interesting content to your library.",
            },
        ],
    }),
});

function RouteComponent() {
    const [isPending, startTransition] = useTransition();
    const [searchResults, setSearchResults] = useState<SearchResultWeb[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
    const [bulkIsPending, startBulkTransition] = useTransition();
    const [progress, setProgress] = useState<BulkScrapeProgress | null>(null);

    function handleSelectAll() {
        if (selectedUrls.size === searchResults.length) {
            setSelectedUrls(new Set());
        } else {
            setSelectedUrls(new Set(searchResults.map((link) => link.url)));
        }
    }

    function handleToggleUrl(url: string) {
        const newSelected = new Set(selectedUrls);

        if (newSelected.has(url)) {
            newSelected.delete(url);
        } else {
            newSelected.add(url);
        }

        setSelectedUrls(newSelected);
    }

    function handleBulkImport() {
        startBulkTransition(async () => {
            if (selectedUrls.size === 0) {
                toast.error("Please select at least one URL to import.");
                return;
            }

            setProgress({
                completed: 0,
                total: selectedUrls.size,
                url: "",
                status: "success",
            });

            let successCount = 0;
            let failedCount = 0;

            for await (const update of await bulkScrapeUrlsFn({
                data: { urls: Array.from(selectedUrls) },
            })) {
                setProgress(update);

                if (update.status === "success") {
                    successCount++;
                } else {
                    failedCount++;
                }
            }

            setProgress(null);

            if (failedCount > 0) {
                toast.success(
                    `Imported ${successCount} Urls (${failedCount} failed)`
                );
            } else {
                toast.success(`Successfully imported ${successCount} URLs`);
            }
        });
    }

    const form = useForm({
        defaultValues: {
            query: "",
        },
        validators: {
            onSubmit: searchSchema,
        },
        onSubmit: ({ value }) => {
            startTransition(async () => {
                const result = await searchWebFn({
                    data: {
                        query: value.query,
                    },
                });

                setSearchResults(result);
            });
        },
    });
    return (
        <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-2xl space-y-6 px-4">
                <div className="text-center">
                    <h1 className="font-bold text-3xl">Discover</h1>
                    <p className="pt-2 text-muted-foreground">
                        Search the web for articles on any topic.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Sparkles className="size-5 text-primary" />
                            Topic Search
                        </CardTitle>

                        <CardDescription>
                            Search the web for content and import what you find
                            interesting.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit();
                            }}
                        >
                            <FieldGroup>
                                <form.Field name="query">
                                    {(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Search Query
                                                </FieldLabel>

                                                <Input
                                                    aria-invalid={isInvalid}
                                                    autoComplete="off"
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g., React Server Components tutorial"
                                                    value={field.state.value}
                                                />

                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        );
                                    }}
                                </form.Field>

                                <Button disabled={isPending} type="submit">
                                    {isPending ? (
                                        <>
                                            <Spinner className="size-4" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="size-4" />
                                            Search Web
                                        </>
                                    )}
                                </Button>
                            </FieldGroup>
                        </form>

                        {/* Discovered URLs list */}
                        {searchResults.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">
                                        Found {searchResults.length} URLs
                                    </p>

                                    <Button
                                        onClick={handleSelectAll}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {selectedUrls.size ===
                                        searchResults.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </Button>
                                </div>

                                <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
                                    {searchResults.map((link) => (
                                        <label
                                            className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50"
                                            key={link.url}
                                        >
                                            <Checkbox
                                                checked={selectedUrls.has(
                                                    link.url
                                                )}
                                                className="mt-0.5"
                                                onCheckedChange={() =>
                                                    handleToggleUrl(link.url)
                                                }
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-sm">
                                                    {link.title ??
                                                        "Title has not been found"}
                                                </p>

                                                <p className="truncate text-muted-foreground text-xs">
                                                    {link.description ??
                                                        "Description has not been found"}
                                                </p>

                                                <p className="truncate text-muted-foreground text-xs">
                                                    {link.url}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {progress && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Importing: {progress.completed}{" "}
                                                / {progress.total}
                                            </span>

                                            <span className="font-medium">
                                                {Math.round(
                                                    progress.completed /
                                                        progress.total
                                                ) * 100}
                                            </span>
                                        </div>

                                        <Progress
                                            value={
                                                (progress.completed /
                                                    progress.total) *
                                                100
                                            }
                                        />
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    disabled={bulkIsPending}
                                    onClick={handleBulkImport}
                                    type="button"
                                >
                                    {bulkIsPending ? (
                                        <>
                                            <Spinner className="size-4" />
                                            {progress
                                                ? `Importing ${progress.completed}/${progress.total}...`
                                                : "Starting..."}
                                        </>
                                    ) : (
                                        `Import ${selectedUrls.size} URLs`
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
