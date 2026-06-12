"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { submitPaymentSlip } from "@/app/actions/orders";
import { paymentMethods } from "@/lib/payment-methods";
import { formatPrice } from "@/lib/format";

export function SlipUpload({
  orderCode,
  total,
  currency,
}: {
  orderCode: string;
  total: number;
  currency: string;
}) {
  const [method, setMethod] = useState(paymentMethods[0].id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Attach a screenshot or photo of your payment slip first.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Slip image must be under 8 MB.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Your session expired. Refresh and sign in again.");
        return;
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${orderCode}-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(path, file, { contentType: file.type || "image/jpeg" });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      const formData = new FormData();
      formData.set("orderCode", orderCode);
      formData.set("method", method);
      formData.set("slipPath", path);
      try {
        await submitPaymentSlip(formData);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Something went wrong. Try again."
        );
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-bold">1 · Pay {formatPrice(total, currency)} by QR</h2>
      <Tabs
        value={method}
        onValueChange={(value) => setMethod(value as typeof method)}
        className="mt-4"
      >
        <TabsList className="w-full">
          {paymentMethods.map((pm) => (
            <TabsTrigger key={pm.id} value={pm.id} className="flex-1">
              {pm.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {paymentMethods.map((pm) => (
          <TabsContent key={pm.id} value={pm.id} className="mt-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative size-44 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                <Image
                  src={pm.qrSrc}
                  alt={`${pm.label} QR code`}
                  fill
                  sizes="176px"
                  className="object-contain p-2"
                />
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">{pm.note}</p>
                <p className="text-lg font-bold">{pm.account}</p>
                <p className="text-sm text-muted-foreground">
                  Account name: <span className="font-semibold text-foreground">{pm.holder}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Transfer exactly{" "}
                  <span className="font-bold text-foreground">
                    {formatPrice(total, currency)}
                  </span>{" "}
                  and keep the receipt screenshot.
                </p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <h2 className="mt-7 font-bold">2 · Upload your payment slip</h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="slip">Slip screenshot</Label>
          <Input
            id="slip"
            ref={fileRef}
            type="file"
            accept="image/*"
            className="h-auto py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/15 px-4 py-3 text-sm font-medium">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          <Upload data-slot="icon" aria-hidden="true" />
          {pending ? "Submitting…" : "Submit slip for review"}
        </Button>
      </form>
    </div>
  );
}
