interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  className = "",
}: AuthCardProps) {
  return (
    <div
      className={`bg-card border border-input rounded-lg p-8 elevated ${className}`}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
