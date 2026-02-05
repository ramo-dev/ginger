import { ScrollArea } from "@/components/ui/scroll-area";
import { changelogData } from "./changelog-data";

export function ChangelogSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-medium">Changelog</h3>
        <p className="text-sm text-muted-foreground">
          Latest updates and improvements to Ginger.
        </p>
      </div>
      <ScrollArea className="space-y-8 h-96">
        {changelogData.map((entry) => (
          <div
            key={entry.version}
            className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:h-full before:w-px before:bg-border last:before:hidden"
          >
            <div className="absolute left-0 top-1 size-6 rounded-full border bg-background flex items-center justify-center">
              <div className="size-2 rounded-full bg-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{entry.version}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.date}
                </span>
              </div>
              {entry.title && (
                <div className="text-sm font-medium">{entry.title}</div>
              )}
              <ul className="space-y-2">
                {entry.changes.map((change) => (
                  <li
                    key={change.description}
                    className="text-sm text-muted-foreground flex gap-2"
                  >
                    <span
                      className={`
                        shrink-0 px-1.5 py-0.5 h-fit rounded text-[10px] font-medium uppercase tracking-wider
                        ${change.type === "feature" && "bg-blue-500/10 text-blue-500"}
                        ${change.type === "fix" && "bg-red-500/10 text-red-500"}
                        ${change.type === "improvement" && "bg-green-500/10 text-green-500"}
                        ${change.type === "other" && "bg-gray-500/10 text-gray-500"}
                      `}
                    >
                      {change.type}
                    </span>
                    <span>{change.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
