"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Wallet, Plus, AlertTriangle, RefreshCw, Lock,
  User, Calendar, DollarSign, CheckCircle2, Receipt,
} from "lucide-react";
import { useCashSession } from "@/hooks/billing-hooks/use-cash-session";
import {
  CashSession,
  CashSessionStatus,
} from "@/lib/api/types/billing-types/billing.types";
import {
  OpenCashSessionDialog,
  CloseCashSessionDialog,
} from "@/components/billing/cash-session-dialogs";
import { formatCurrency } from "@/lib/utils";

export default function CashSessionsPage() {
  const {
    mySession,
    openSessions,
    isLoadingMine,
    isLoadingOpen,
    isMutating,
    error,
    fetchMySession,
    fetchOpenSessions,
    openSession,
    closeSession,
    clearError,
  } = useCashSession();

  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [sessionToClose, setSessionToClose] = useState<CashSession | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchOpenSessions();
  }, [fetchOpenSessions]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const totalCollected = useMemo(
    () => openSessions.reduce((acc, s) => acc + s.total_collected, 0),
    [openSessions]
  );

  const handleOpen = async (initialCash: number, notes?: string) => {
    await openSession({
      initial_cash: initialCash,
      ...(notes && { notes }),
    });
    setSuccessMsg("Sesión de caja abierta");
    await fetchOpenSessions();
  };

  const handleClose = async (actualCash: number, notes?: string) => {
    if (!sessionToClose) return;
    await closeSession(sessionToClose.id, {
      actual_cash: actualCash,
      ...(notes && { notes }),
    });
    setSuccessMsg("Sesión cerrada (corte realizado)");
    setSessionToClose(null);
    await fetchOpenSessions();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sesiones de caja</h1>
            <p className="text-muted-foreground">
              Apertura, seguimiento y corte diario de caja.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchMySession();
                fetchOpenSessions();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
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

        {/* ── Mi sesión ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Mi sesión actual
            </CardTitle>
            <CardDescription>
              Sólo puedes tener una sesión abierta a la vez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMine ? (
              <Skeleton className="h-16 w-full" />
            ) : mySession && mySession.status === CashSessionStatus.OPEN ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono">
                      {mySession.session_number}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      Abierta
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Abierta el{" "}
                    {new Date(mySession.opened_at).toLocaleString("es-GT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Inicial:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(mySession.initial_cash)}
                      </span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Cobrado:</span>{" "}
                      <span className="font-medium text-emerald-700">
                        {formatCurrency(mySession.total_collected)}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setSessionToClose(mySession)}
                  disabled={isMutating}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Cerrar mi sesión
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">No tienes una sesión abierta</p>
                  <p className="text-sm text-muted-foreground">
                    Abre una sesión para empezar a registrar cobros en efectivo.
                  </p>
                </div>
                <Button onClick={() => setIsOpenDialogOpen(true)} disabled={isMutating}>
                  <Plus className="mr-2 h-4 w-4" />
                  Abrir sesión de caja
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Sesiones abiertas (todos los cajeros) ───────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4" />
                  Sesiones abiertas
                </CardTitle>
                <CardDescription>
                  Cajas activas en este momento.
                </CardDescription>
              </div>
              <Badge variant="outline">
                {formatCurrency(totalCollected)} cobrados
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingOpen ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : openSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wallet className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">
                  Ninguna caja abierta
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sesión</TableHead>
                    <TableHead>Cajero</TableHead>
                    <TableHead>Abierta</TableHead>
                    <TableHead className="text-right">Inicial</TableHead>
                    <TableHead className="text-right">Cobrado</TableHead>
                    <TableHead className="text-right">Esperado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openSessions.map((s) => {
                    const expected = s.initial_cash + s.total_collected;
                    const isMine = mySession?.id === s.id;
                    return (
                      <TableRow key={s.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {s.session_number}
                            </Badge>
                            {isMine && (
                              <Badge variant="secondary">Mía</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{s.cashier_name ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(s.opened_at).toLocaleString("es-GT", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(s.initial_cash)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-emerald-700 font-medium">
                          {formatCurrency(s.total_collected)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(expected)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSessionToClose(s)}
                            disabled={isMutating}
                          >
                            <Lock className="mr-1 h-3 w-3" />
                            Cerrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sesiones abiertas</p>
                <p className="text-2xl font-bold">{openSessions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total cobrado</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(totalCollected)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                <Receipt className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobrado promedio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    openSessions.length
                      ? totalCollected / openSessions.length
                      : 0
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OpenCashSessionDialog
        open={isOpenDialogOpen}
        onOpenChange={setIsOpenDialogOpen}
        onSubmit={async ({ initial_cash, notes }) => {
          await handleOpen(initial_cash, notes);
        }}
      />

      {sessionToClose && (
        <CloseCashSessionDialog
          open={!!sessionToClose}
          onOpenChange={(o) => !o && setSessionToClose(null)}
          onSubmit={async ({ actual_cash, notes }) => {
            await handleClose(actual_cash, notes);
          }}
          sessionNumber={sessionToClose.session_number}
          expectedCash={
            sessionToClose.initial_cash + sessionToClose.total_collected
          }
        />
      )}
    </DashboardLayout>
  );
}
