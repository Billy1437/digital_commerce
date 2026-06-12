const statusStyles: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "Awaiting payment",
    className: "bg-secondary text-foreground",
  },
  PAYMENT_SUBMITTED: {
    label: "Slip under review",
    className: "bg-[#8a6d1f]/30 text-[#f0c75e]",
  },
  PAID: { label: "Payment verified", className: "bg-[#1f8a4c]/25 text-[#5ee49a]" },
  COMPLETED: { label: "Completed", className: "bg-[#1f8a4c]/25 text-[#5ee49a]" },
  CANCELLED: { label: "Cancelled", className: "bg-secondary text-muted-foreground" },
  REJECTED: { label: "Slip rejected", className: "bg-destructive/20 text-[#ff8d85]" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? {
    label: status,
    className: "bg-secondary text-foreground",
  };
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${style.className}`}
    >
      {style.label}
    </span>
  );
}
