"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Banknote, Building2, FileText, Wallet,
  Loader2, AlertTriangle, DollarSign, Check,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  RecordPaymentRequest,
} from "@/lib/api/types/billing-types/billing.types";
import { useCashSession } from "@/hooks/billing-hooks/use-cash-session";
import { formatCurrency } from "@/lib/utils";

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecordPaymentRequest) => Promise<void>;
  amountPending: number;
  patientName?: string;
  invoiceNumber?: string;
}

const CARD_BRANDS = ["Visa", "Mastercard", "Amex", "Discover", "Otra"];

export function RegisterPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  amountPending,
  patientName,
  invoiceNumber,
}: RegisterPaymentDialogProps) {
  const { mySession } = useCashSession();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );
  const [amount, setAmount] = useState<number>(amountPending);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [bankName, setBankName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(amountPending);
      setError(null);
      setSuccess(null);
      setReferenceNumber("");
      setCardBrand("");
      setCardLastFour("");
      setBankName("");
      setNotes("");
      // Default to cash if a session is open, otherwise to bank transfer.
      setPaymentMethod(mySession ? PaymentMethod.CASH : PaymentMethod.BANK_TRANSFER);
    }
  }, [open, amountPending, mySession]);

  const requiresReference = paymentMethod !== PaymentMethod.CASH;
  const requiresCardBrand =
    paymentMethod === PaymentMethod.CARD_CREDIT ||
    paymentMethod === PaymentMethod.CARD_DEBIT;
  const requiresCardLastFour = requiresCardBrand;
  const requiresBankName =
    paymentMethod === PaymentMethod.BANK_TRANSFER ||
    paymentMethod === PaymentMethod.CHECK;

  const validate = (): string | null => {
    if (!amount || amount <= 0) return "El monto debe ser mayor a cero";
    if (amount > amountPending + 0.01)
      return `El monto no puede superar el saldo pendiente (${formatCurrency(amountPending)})`;
    if (paymentMethod === PaymentMethod.CASH && !mySession)
      return "Necesitas tener una sesión de caja abierta para cobrar en efectivo";
    if (requiresCardLastFour && !/^\d{4}$/.test(cardLastFour))
      return "Los últimos 4 dígitos deben ser numéricos";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const body: RecordPaymentRequest = {
        payment_method: paymentMethod,
        amount,
        ...(mySession && paymentMethod === PaymentMethod.CASH && {
          cash_session_id: mySession.id,
        }),
        ...(referenceNumber.trim() && { reference_number: referenceNumber.trim() }),
        ...(cardBrand && { card_brand: cardBrand }),
        ...(cardLastFour && { card_last_four: cardLastFour }),
        ...(bankName.trim() && { bank_name: bankName.trim() }),
        ...(notes.trim() && { notes: notes.trim() }),
      };
      await onSubmit(body);
      setSuccess("Pago registrado correctamente");
      setTimeout(() => onOpenChange(false), 900);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo registrar el pago";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const methodOptions = Object.values(PaymentMethod);

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <DialogTitle>Registrar pago</DialogTitle>
              <DialogDescription className="truncate">
                {invoiceNumber ? `${invoiceNumber} · ` : ""}
                {patientName ?? ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No se pudo registrar el pago</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <Check className="h-4 w-4 text-emerald-700" />
              <AlertDescription className="text-emerald-700 font-medium">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border bg-muted/40 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Saldo pendiente</span>
            <span className="font-bold tabular-nums">
              {formatCurrency(amountPending)}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Método de pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {paymentMethod === PaymentMethod.CASH && !mySession && (
              <p className="text-xs text-amber-700">
                No tienes una sesión de caja abierta.{" "}
                <a href="/billing/cash-sessions" className="underline">
                  Abrir sesión
                </a>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Monto <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Q
              </span>
              <Input
                id="amount"
                type="number"
                min={0.01}
                step={0.01}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="pl-9 h-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {requiresReference && (
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-medium">
                No. de referencia
              </Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={
                  paymentMethod === PaymentMethod.INSURANCE
                    ? "Código de autorización del seguro"
                    : "Número de transacción / voucher"
                }
                className="h-10"
                disabled={isSubmitting}
              />
            </div>
          )}

          {requiresCardBrand && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Marca</Label>
                <Select
                  value={cardBrand || "__none__"}
                  onValueChange={(v) => setCardBrand(v === "__none__" ? "" : v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {CARD_BRANDS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastFour" className="text-sm font-medium">
                  Últimos 4 dígitos
                </Label>
                <Input
                  id="lastFour"
                  value={cardLastFour}
                  onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="0000"
                  maxLength={4}
                  inputMode="numeric"
                  className="h-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {requiresBankName && (
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-sm font-medium">
                Banco
              </Label>
              <Input
                id="bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Nombre del banco"
                className="h-10"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones del pago..."
              rows={2}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <MethodSummary
            method={paymentMethod}
            cashSession={!!mySession}
          />
        </form>

        <DialogFooter className="px-6 pb-6 pt-4 border-t gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MethodSummary({
  method,
  cashSession,
}: {
  method: PaymentMethod;
  cashSession: boolean;
}) {
  const Icon =
    method === PaymentMethod.CASH
      ? Banknote
      : method === PaymentMethod.BANK_TRANSFER
      ? Building2
      : method === PaymentMethod.CHECK
      ? FileText
      : method === PaymentMethod.INSURANCE
      ? Wallet
      : CreditCard;
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span>
        {PAYMENT_METHOD_LABELS[method]}
        {method === PaymentMethod.CASH && cashSession && (
          <Badge variant="outline" className="ml-2 text-[10px] py-0">
            Sesión abierta
          </Badge>
        )}
      </span>
    </div>
  );
}
