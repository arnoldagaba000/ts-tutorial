import { Link, linkOptions } from "@tanstack/react-router";
import { BookmarkIcon, CompassIcon, ImportIcon } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import type { NavPrimaryProps, NavUserProps } from "@/types/nav";
import { NavPrimary } from "./nav-primary";
import { NavUser } from "./nav-user";

const navItems: NavPrimaryProps["items"] = linkOptions([
    {
        title: "Items",
        icon: BookmarkIcon,
        to: "/dashboard/items",
        activeOptions: {
            exact: false,
        },
    },
    {
        title: "Import",
        icon: ImportIcon,
        to: "/dashboard/import",
        activeOptions: {
            exact: false,
        },
    },
    {
        title: "Discover",
        icon: CompassIcon,
        to: "/dashboard/discover",
        activeOptions: {
            exact: false,
        },
    },
]);

export function AppSidebar({ user }: NavUserProps) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            render={
                                <Link
                                    className="flex items-center gap-3"
                                    to="/dashboard"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <BookmarkIcon className="size-4" />
                                    </div>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="font-bold uppercase">
                                            Recall
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Your AI Knowledge Base
                                        </span>
                                    </div>
                                </Link>
                            }
                            size="lg"
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavPrimary items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
