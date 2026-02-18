import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, TreePine, MapPinned } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
    { title: 'Dashboard', href: '/trees', icon: LayoutDashboard },
    { title: 'Missing Trees', href: '/trees/missing', icon: TreePine },
    { title: 'Duplicate Coordinates', href: '/trees/duplicates', icon: MapPinned },
];

export function TreeSidebar() {
    const { url } = usePage();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/trees" prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <TreePine className="size-5" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="truncate leading-tight font-bold">Cek Pohon</span>
                                    <span className="truncate text-xs text-sidebar-foreground/60">Tree Checker</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={url === item.href}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ThemeToggle />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
