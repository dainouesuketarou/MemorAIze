interface DashboardHeaderProps {
  heading: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  description,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-2">
      <div className="grid gap-1 flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide break-words">
          {heading}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex-none">{children}</div>}
    </div>
  );
}
