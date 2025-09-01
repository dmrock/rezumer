import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-between pb-5">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
          {description ? (
            <p className="text-muted-foreground text-lg">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {/* Full-bleed underline across the viewport, slightly thicker and brighter */}
      <div className="pointer-events-none absolute left-1/2 bottom-0 h-[1.5px] w-screen -translate-x-1/2 bg-[var(--color-border)] opacity-80" />
    </div>
  );
}
