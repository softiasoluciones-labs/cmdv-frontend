"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  Stethoscope,
  Receipt,
  Pill,
  ChevronLeft,
  ChevronRight,
  Building2,
  Truck,
  Warehouse,
  ClipboardList,
  CreditCard,
  UserCog,
  FolderOpen,
  Calendar,
  Scissors,
  ShoppingCart,
  FileText,
  Activity,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: { title: string; href: string; icon: React.ElementType }[]
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
    children: [
      { title: "Lista de Usuarios", href: "/admin/users", icon: Users },
      { title: "Roles y Permisos", href: "/admin/users", icon: UserCog },
    ],
  },
  { title: "Parámetros", href: "/admin/settings", icon: Settings },
  {
    title: "Inventario",
    href: "/inventory",
    icon: Package,
    children: [
      { title: "Productos", href: "/inventory", icon: Package },
      { title: "Proveedores", href: "/inventory", icon: Truck },
      { title: "Bodegas", href: "/inventory", icon: Warehouse },
      { title: "Órdenes de Compra", href: "/inventory", icon: ClipboardList },
      { title: "Pagos a Proveedores", href: "/inventory", icon: CreditCard },
    ],
  },
  {
    title: "Médico",
    href: "/medical/patients",
    icon: Stethoscope,
    children: [
      { title: "Pacientes", href: "/medical/patients", icon: Users },
      { title: "Expedientes", href: "/medical/case-files", icon: FolderOpen },
      { title: "Paquetes", href: "/medical/patients", icon: Package },
      { title: "Catálogo de Operaciones", href: "/medical/patients", icon: Scissors },
      { title: "Programación de Cirugías", href: "/medical/patients", icon: Calendar },
    ],
  },
  {
    title: "Facturación",
    href: "/billing/invoices",
    icon: Receipt,
    children: [
      { title: "Facturas", href: "/billing/invoices", icon: FileText },
      { title: "Pagos", href: "/billing/payments", icon: CreditCard },
      { title: "Reportes", href: "/reports", icon: Activity },
    ],
  },
  {
    title: "Farmacia",
    href: "/pharmacy",
    icon: Pill,
    children: [
      { title: "Punto de Venta", href: "/pharmacy", icon: ShoppingCart },
      { title: "Stock", href: "/pharmacy", icon: Package },
      { title: "Historial de Ventas", href: "/pharmacy", icon: Receipt },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">MediCare Pro</span>
                <span className="text-xs text-sidebar-foreground/60">Sistema Hospitalario</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary mx-auto">
              <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedItems.includes(item.title)
              const active = isActive(item.href)

              if (collapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <div key={item.title}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                      </button>
                      {isExpanded && (
                        <div className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon
                            const childActive = pathname === child.href
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                  childActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                )}
                              >
                                <ChildIcon className="h-4 w-4" />
                                <span>{child.title}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Collapse Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "px-0",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" />
                <span>Colapsar</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
