"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth-hooks/use-auth";
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
  LogOut,
  Sliders,
  Puzzle,
  Plug,
  CalendarClock,
  Bell,
  Megaphone,
  BookUser,
} from "lucide-react";

const STORAGE_KEY = "sidebar-expanded-items";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string; icon: React.ElementType }[];
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
    children: [
      { title: "Lista de Usuarios", href: "/admin/users", icon: Users },
      { title: "Roles y Permisos", href: "/admin/rols", icon: UserCog },
    ],
  },
  {
    title: "Inventario",
    href: "/inventory",
    icon: Package,
    children: [
      { title: "Productos", href: "/inventory", icon: Package },
      { title: "Proveedores", href: "/inventory/suppliers", icon: Truck },
      { title: "Bodegas", href: "/inventory/warehouses", icon: Warehouse },
      {
        title: "Órdenes de Compra",
        href: "/inventory/purchase-orders",
        icon: ClipboardList,
      },
      {
        title: "Pagos a Proveedores",
        href: "/inventory/payments-suppliers",
        icon: CreditCard,
      },
      {
        title: "Aprobacion de PO",
        href: "/inventory/purchase-orders/status",
        icon: UserCog,
      },
      {
        title: "Despachos de bodega",
        href: "/inventory/warehouse-dispatches",
        icon: Truck,
      },
    ],
  },
  {
    title: "Médico",
    href: "/medical/patients",
    icon: Stethoscope,
    children: [
      { title: "Pacientes", href: "/medical/patients", icon: Users },
      { title: "Expedientes", href: "/medical/case-files", icon: FolderOpen },
      { title: "Paquetes", href: "/medical/packages", icon: Package },
      { title: "Catálogo de Operaciones", href: "", icon: Scissors },
      {
        title: "Programación de Cirugías",
        href: "/medical/schedule-operations",
        icon: Calendar,
      },
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
      { title: "Stock", href: "/pharmacy/stock-pharmacy", icon: Package },
      {
        title: "Historial de Ventas",
        href: "/pharmacy/sales-history",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Herramientas",
    href: "/admin/tools",
    icon: CalendarClock,
    children: [
      { title: "Calendarios", href: "/admin/tools/calendars", icon: Calendar },
      { title: "Agenda", href: "/admin/tools/contacts", icon: BookUser },
      {
        title: "Notificaciones",
        href: "/admin/tools/notifications",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "Sistema",
    href: "/admin/system",
    icon: Settings,
    children: [
      {
        title: "Configuraciones",
        href: "/admin/system/settings",
        icon: Sliders,
      },
      {
        title: "Extensiones",
        href: "/admin/system/extensions",
        icon: Puzzle,
      },
      {
        title: "Servicios",
        href: "/admin/system/services",
        icon: Plug,
      },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpandedItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedItems));
  }, [expandedItems]);

  useEffect(() => {
    const shouldAutoExpand = navigation.find((item) =>
      item.children?.some((child) => pathname === child.href)
    );
    if (shouldAutoExpand && !expandedItems.includes(shouldAutoExpand.title)) {
      setExpandedItems((prev) => [...prev, shouldAutoExpand.title]);
    }
  }, [pathname]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-72",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-sidebar-foreground truncate">
                  MediCare Pro
                </span>
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  Sistema Hospitalario
                </span>
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
        <ScrollArea className="h-[calc(100vh-13rem)]">
          <nav className="p-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.title);
              const active = isActive(item.href);

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
                    <TooltipContent
                      side="right"
                      className="bg-popover text-popover-foreground"
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
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
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-5 w-5 shrink-0" />
<span className="font-medium truncate">{item.title}</span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <div className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors min-w-0",
                                  childActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                )}
                              >
                                <ChildIcon className="h-4 w-4 shrink-0" />
                                <span className="font-medium truncate">{child.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-w-0",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium truncate">{item.title}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Info & Actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border">
          <div className="p-2">
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
        </div>
      </aside>
    </TooltipProvider>
  );
}

/*function UserInfo() {
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  if (!user) return null

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user.name}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {user.email}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span>Cerrar Sesión</span>
      </Button>
    </div>
  )
}*/
