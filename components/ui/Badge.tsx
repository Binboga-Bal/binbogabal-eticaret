import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "discount" | "new" | "bestseller" | "info";
  className?: string;
}

const variants = {
  discount: "bg-honey-dark text-white",
  new: "bg-green-600 text-white",
  bestseller: "bg-honey text-white",
  info: "bg-gray-100 text-gray-700",
};

export function Badge({ children, variant = "info", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-bold px-2 py-1 rounded",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
