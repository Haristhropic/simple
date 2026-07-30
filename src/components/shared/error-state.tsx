import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-20 text-center", className)}>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
