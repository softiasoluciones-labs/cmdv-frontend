"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Supplier, editSupplierData } from "@/lib/api/types/inventory-types/inventory.types";

const PAYMENT_TERMS = ["immediate", "one_payment", "two_payments", "three_payments"] as const;

const supplierSchema = z.object({
  code: z
    .string()
    .min(2, "Código obligatorio (mín. 2)")
    .max(20, "Código demasiado largo")
    .transform((v) => v.toUpperCase()),
  name: z
    .string()
    .min(2, "Nombre obligatorio")
    .max(120, "Nombre demasiado largo"),
  contactName: z.string().max(120).optional().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .max(254)
    .optional()
    .or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  taxId: z.string().max(40).optional().or(z.literal("")),
  paymentTerms: z.enum(PAYMENT_TERMS),
  creditLimit: z
    .number({ invalid_type_error: "Debe ser un número" })
    .min(0, "No puede ser negativo")
    .max(100_000_000, "Valor demasiado alto"),
  isActive: z.boolean(),
  country: z.string().max(80).optional().or(z.literal("")),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  initialData?: Partial<Supplier> | Partial<editSupplierData>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: SupplierFormValues) => void | Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: SupplierFormValues = {
  code: "",
  name: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  city: "Guatemala",
  taxId: "",
  paymentTerms: "immediate",
  creditLimit: 0,
  isActive: true,
  country: "Guatemala",
};

function toFormValues(data?: Partial<Supplier> | Partial<editSupplierData>): SupplierFormValues {
  if (!data) return EMPTY_VALUES;
  return {
    code: data.code ?? "",
    name: data.name ?? "",
    contactName: data.contactName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    city: data.city ?? "Guatemala",
    taxId: data.taxId ?? "",
    paymentTerms: (PAYMENT_TERMS as readonly string[]).includes(
      data.paymentTerms ?? "",
    )
      ? (data.paymentTerms as SupplierFormValues["paymentTerms"])
      : "immediate",
    creditLimit: data.creditLimit ?? 0,
    isActive: (data as Partial<Supplier>).isActive ?? true,
    country: (data as Partial<editSupplierData>).country ?? "Guatemala",
  };
}

export function SupplierForm({
  initialData,
  submitLabel = "Guardar Proveedor",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: toFormValues(initialData),
    mode: "onBlur",
  });

  useEffect(() => {
    reset(toFormValues(initialData));
  }, [initialData, reset]);

  const paymentTerms = watch("paymentTerms");
  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="supplier-code" label="Código *" error={errors.code?.message}>
          <Input
            id="supplier-code"
            placeholder="Ej: DISA-GT, FARMEX"
            autoCapitalize="characters"
            {...register("code")}
          />
        </Field>
        <Field
          id="supplier-name"
          label="Nombre Empresa *"
          error={errors.name?.message}
        >
          <Input
            id="supplier-name"
            placeholder="Nombre completo de la empresa"
            {...register("name")}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="supplier-contact"
          label="Contacto Principal"
          error={errors.contactName?.message}
        >
          <Input
            id="supplier-contact"
            placeholder="Nombre del contacto"
            {...register("contactName")}
          />
        </Field>
        <Field
          id="supplier-tax"
          label="NIT / Identificación Tributaria"
          error={errors.taxId?.message}
        >
          <Input
            id="supplier-tax"
            placeholder="NIT-1234567-8"
            {...register("taxId")}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="supplier-phone"
          label="Teléfono"
          error={errors.phone?.message}
        >
          <Input
            id="supplier-phone"
            placeholder="2255-0000"
            inputMode="tel"
            {...register("phone")}
          />
        </Field>
        <Field id="supplier-email" label="Email" error={errors.email?.message}>
          <Input
            id="supplier-email"
            type="email"
            autoComplete="off"
            placeholder="contacto@empresa.com"
            {...register("email")}
          />
        </Field>
      </div>

      <Field
        id="supplier-address"
        label="Dirección"
        error={errors.address?.message}
      >
        <Input
          id="supplier-address"
          placeholder="Dirección completa"
          {...register("address")}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field id="supplier-city" label="Ciudad" error={errors.city?.message}>
          <Input id="supplier-city" {...register("city")} />
        </Field>
        <Field
          id="supplier-country"
          label="País"
          error={errors.country?.message}
        >
          <Input id="supplier-country" {...register("country")} />
        </Field>
        <Field
          id="supplier-payment"
          label="Términos de Pago"
          error={errors.paymentTerms?.message}
        >
          <Select
            value={paymentTerms}
            onValueChange={(v) =>
              setValue(
                "paymentTerms",
                v as SupplierFormValues["paymentTerms"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger id="supplier-payment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Contado</SelectItem>
              <SelectItem value="one_payment">Un pago</SelectItem>
              <SelectItem value="two_payments">Dos pagos</SelectItem>
              <SelectItem value="three_payments">Tres pagos</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        id="supplier-credit"
        label="Límite de Crédito (Q)"
        error={errors.creditLimit?.message}
      >
        <Input
          id="supplier-credit"
          type="number"
          min={0}
          step={100}
          placeholder="50000"
          {...register("creditLimit", { valueAsNumber: true })}
        />
      </Field>

      <div className="flex items-center space-x-2">
        <Switch
          id="supplier-active"
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("isActive", checked, { shouldValidate: true })
          }
        />
        <Label htmlFor="supplier-active">Proveedor activo</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
