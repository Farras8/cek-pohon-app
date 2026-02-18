import type { PropsWithChildren } from 'react';
import { TreeSidebar } from '@/components/tree-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function TreeLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <TreeSidebar />
            <SidebarInset>
                <div className="flex flex-1 flex-col">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
