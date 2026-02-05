/** biome-ignore-all lint/a11y/noLabelWithoutControl: Ignore */

import type { SearchResultWeb } from "@mendable/firecrawl-js";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { GlobeIcon, LinkIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    type BulkScrapeProgress,
    bulkScrapeUrlsFn,
    mapUrlFn,
    scrapeUrlFn,
} from "@/data/items";
import { bulkImportSchema, importSchema } from "@/schemas/import";

export const Route = createFileRoute("/dashboard/import")({
    component: RouteComponent,
});

function RouteComponent() {
    const [isPending, startTransition] = useTransition();
    const [bulkIsPending, startBulkTransition] = useTransition();

    // Bulk import state
    const [discoveredLinks, setDiscoveredLinks] = useState<SearchResultWeb[]>(
        []
    );
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

    const [progress, setProgress] = useState<BulkScrapeProgress | null>(null);

    const handleSelectAll = () => {
        if (selectedUrls.size === discoveredLinks.length) {
            setSelectedUrls(new Set());
        } else {
            setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)));
        }
    };

    const handleToggleUrl = (url: string) => {
        const newSelected = new Set(selectedUrls);

        if (newSelected.has(url)) {
            newSelected.delete(url);
        } else {
            newSelected.add(url);
        }

        setSelectedUrls(newSelected);
    };

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
        defaultValues: { url: "" },
        validators: {
            onSubmit: importSchema,
        },
        onSubmit: ({ value }) =>
            startTransition(async () => {
                await scrapeUrlFn({ data: value });
                toast.success("URL scrapped successfully");
            }),
    });

    const bulkForm = useForm({
        defaultValues: { url: "", search: "" },
        validators: {
            onSubmit: bulkImportSchema,
        },
        onSubmit: ({ value }) =>
            startTransition(async () => {
                const data = await mapUrlFn({ data: value });
                setDiscoveredLinks(data);
            }),
    });

    return (
        <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-2xl space-y-6 px-4">
                <div className="text-center">
                    <h1 className="font-bold text-3xl">Import Content</h1>
                    <p className="pt-1 text-muted-foreground">
                        Save web pages to your libarary for later reading
                    </p>
                </div>

                <Tabs defaultValue="single">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger className="gap-2" value="single">
                            <LinkIcon className="size-4" />
                            Single URL
                        </TabsTrigger>

                        <TabsTrigger className="gap-2" value="bulk">
                            <GlobeIcon className="size-4" />
                            Bulk Import
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single">
                        <Card>
                            <CardHeader>
                                <CardTitle>Import Single URL</CardTitle>
                                <CardDescription>
                                    Scrape and save content fro any web app! 👀
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        form.handleSubmit();
                                    }}
                                >
                                    <FieldGroup>
                                        <form.Field name="url">
                                            {(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;

                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                        >
                                                            URL
                                                        </FieldLabel>
                                                        <Input
                                                            autoComplete="off"
                                                            id={field.name}
                                                            name={field.name}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="https://tanstack.com/start/latest"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        </form.Field>

                                        <Button
                                            disabled={isPending}
                                            type="submit"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Spinner className="size-4" />{" "}
                                                    "Processing..."
                                                </>
                                            ) : (
                                                "Import URL"
                                            )}
                                        </Button>
                                    </FieldGroup>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bulk">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bulk Import</CardTitle>
                                <CardDescription>
                                    Discover and import multiple URLs from a
                                    website at once 🚀
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        bulkForm.handleSubmit();
                                    }}
                                >
                                    <FieldGroup>
                                        <bulkForm.Field name="url">
                                            {(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;

                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                        >
                                                            URL
                                                        </FieldLabel>
                                                        <Input
                                                            autoComplete="off"
                                                            id={field.name}
                                                            name={field.name}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="https://tanstack.com/start/latest"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        </bulkForm.Field>

                                        <bulkForm.Field name="search">
                                            {(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;

                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                        >
                                                            Filter (optional)
                                                        </FieldLabel>
                                                        <Input
                                                            autoComplete="off"
                                                            id={field.name}
                                                            name={field.name}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="e.g. Blog, docs, tutorial"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        </bulkForm.Field>

                                        <Button
                                            disabled={isPending}
                                            type="submit"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Spinner className="mr-2 size-4" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Import URLs"
                                            )}
                                        </Button>
                                    </FieldGroup>
                                </form>

                                {/* Discovered URLs list */}
                                {discoveredLinks.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm">
                                                Found {discoveredLinks.length}{" "}
                                                URLs
                                            </p>

                                            <Button
                                                onClick={handleSelectAll}
                                                size="sm"
                                                variant="outline"
                                            >
                                                {selectedUrls.size ===
                                                discoveredLinks.length
                                                    ? "Deselect All"
                                                    : "Select All"}
                                            </Button>
                                        </div>

                                        <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
                                            {discoveredLinks.map((link) => (
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
                                                            handleToggleUrl(
                                                                link.url
                                                            )
                                                        }
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-sm">
                                                            {link.title ??
                                                                "Title has not been found"}
                                                        </p>

                                                        <p className="truncate text-muted-foreground text-xs">
                                                            {link.description ??
                                                                "Description hasnot been found"}
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
                                                        Importing:{" "}
                                                        {progress.completed} /{" "}
                                                        {progress.total}
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
                                                    <Spinner className="size-4" />{" "}
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
