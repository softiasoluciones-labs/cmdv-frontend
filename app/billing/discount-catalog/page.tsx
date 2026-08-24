"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, Plus, Tag, AlertTriangle, RefreshCw, Percent, DollarSign,
  CheckCircle2,
} from "lucide-react";
import { useDiscountCatalog } from "@/hooks/billing-hooks/use-discount-catalog";
import {
  DiscountCatalogItem,
  DiscountCategory,
  DiscountType,
  DISCOUNT_CATEGORY_LABELS,
  DISCOUNT_TYPE_LABELS,
} from "@/lib/api/types/billing-types/billing.types";
import { CreateDiscountDialog } from "@/components/billing/create-discount-dialog";

export default function DiscountCatalogPage() {
  const { items, isLoading, error, fetchCatalog, createItem, clearError } =
    useDiscountCatalog();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-hide success
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((it) => {
      const matchesSearch =
        !q ||
        it.code.toLowerCase().includes(q) ||
        it.name.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "all" || it.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      needApproval: items.filter((i) => i.requires_approval).length,
      percentage: items.filter((i) => i.discount_type === DiscountType.PERCENTAGE).length,
      fixed: items.filter((i) => i.discount_type === DiscountType.FIXED_AMOUNT).length,
    };
  }, [items]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Catálogo de descuentos
            </h1>
            <p className="text-muted-foreground">
              Descuentos reutilizables al aplicar a una factura.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCatalog}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo descuento
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-2">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <AlertDescription className="text-emerald-700 font-medium">
              {successMsg}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total descuentos"
            value={String(stats.total)}
            icon={Tag}
            color="text-primary"
            bg="bg-primary/10"
          />
          <StatCard
            label="Requieren aprobación"
            value={String(stats.needApproval)}
            icon={AlertTriangle}
            color="text-amber-600"
            bg="bg-amber-500/10"
          />
          <StatCard
            label="Porcentaje"
            value={String(stats.percentage)}
            icon={Percent}
            color="text-blue-600"
            bg="bg-blue-500/10"
          />
          <StatCard
            label="Monto fijo"
            value={String(stats.fixed)}
            icon={DollarSign}
            color="text-emerald-600"
            bg="bg-emerald-500/10"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Descuentos disponibles</CardTitle>
                <CardDescription>
                  Activos y listos para aplicar a cualquier factura.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código o nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 sm:w-[260px]"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.values(DiscountCategory).map((c) => (
                      <SelectItem key={c} value={c}>
                        {DISCOUNT_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Tag className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">
                  No hay descuentos en el catálogo
                </p>
                <p className="text-sm text-muted-foreground">
                  Crea el primer descuento para empezar.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Tope</TableHead>
                    <TableHead>Aprobación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((it) => (
                    <DiscountRow key={it.id} item={it} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateDiscountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (data) => {
          await createItem(data);
          setSuccessMsg("Descuento creado");
        }}
      />
    </DashboardLayout>
  );
}

function DiscountRow({ item }: { item: DiscountCatalogItem }) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono text-xs">
        <Badge variant="outline">{item.code}</Badge>
      </TableCell>
      <TableCell>
        <p className="font-medium">{item.name}</p>
        {item.is_active === false && (
          <Badge variant="secondary" className="mt-1 text-xs">
            Inactivo
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {DISCOUNT_CATEGORY_LABELS[item.category]}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {DISCOUNT_TYPE_LABELS[item.discount_type]}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {item.value}
        {item.discount_type === DiscountType.PERCENTAGE ? "%" : ""}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {item.max_amount != null ? `Q ${item.max_amount}` : "—"}
      </TableCell>
      <TableCell>
        {item.requires_approval ? (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Requiere
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Directo
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
