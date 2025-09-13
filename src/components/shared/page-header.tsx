import { ReactNode, isValidElement, cloneElement, ReactElement } from "react";
import { twMerge } from "tailwind-merge";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  // If an action element is provided we clone it to enforce a smaller size on mobile
  const sizedAction: ReactNode = (() => {
    if (action && isValidElement(action)) {
      const actionElement = action as ReactElement<{ className?: string }>;
      return cloneElement(actionElement, {
        // Merge user-provided classes first, then apply enforced mobile-first sizing so they win on conflicts
        className: twMerge(
          actionElement.props.className || "",
          // Enforced defaults appended so that in conflict (e.g., different h-/px-/text- size) these take precedence for mobile
          "h-8 px-2.5 text-sm sm:h-9 sm:px-3",
        ),
      });
    }
    return action;
  })();

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-between gap-4 pb-5">
        <div className="min-w-0">
          <h1 className="text-foreground mb-2 text-2xl leading-tight font-bold sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground text-base sm:text-lg">{description}</p>
          ) : null}
        </div>
        {sizedAction ? <div className="shrink-0">{sizedAction}</div> : null}
      </div>
      {/* Full-bleed underline across the viewport */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[1.5px] w-screen -translate-x-1/2 bg-[var(--color-border)] opacity-80" />
    </div>
  );
}
