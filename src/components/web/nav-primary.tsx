import { Link } from "@tanstack/react-router";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavPrimaryProps } from "@/types/nav";

export function NavPrimary({ items }: NavPrimaryProps) {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    render={
                                        <Link
                                            activeOptions={item.activeOptions}
                                            activeProps={{
                                                "data-active": true,
                                            }}
                                            to={item.to}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    }
                                    size="sm"
                                />
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
