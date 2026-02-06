import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Cpu, Terminal } from 'lucide-react'
import { config } from '@/lib/config'

interface SiteHeaderProps {
  selectedObject: string | null;
  selectedView: 'overview' | 'packages' | 'object';
  packageLabel?: string;
}

export function SiteHeader({ selectedObject, selectedView, packageLabel }: SiteHeaderProps) {
  const viewLabels: Record<string, string> = {
    overview: 'Overview',
    packages: 'Package Manager',
    object: selectedObject || 'Object',
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#" className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                {packageLabel || 'ObjectStack'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {viewLabels[selectedView] || 'Overview'}
              </BreadcrumbPage>
            </BreadcrumbItem>
            {selectedView === 'object' && selectedObject && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{selectedObject}</code>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        {selectedView === 'object' && selectedObject && (
          <Badge variant="outline" className="font-mono text-[10px] gap-1 hidden sm:flex">
            /api/v1/data/{selectedObject}
          </Badge>
        )}
        <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
          <Cpu className="h-2.5 w-2.5" />
          {config.mode.toUpperCase()}
        </Badge>
        <ThemeToggle />
      </div>
    </header>
  )
}
