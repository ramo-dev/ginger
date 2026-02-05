import { RiComputerLine, RiMoonLine, RiSunLine } from '@remixicon/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export function GeneralSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <h3 className="text-lg font-medium">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage general application settings.
          </p>
        </div>
        <div className="space-y-4 rounded-xl border p-4">
          <div className="h-20 bg-muted/20 animate-pulse rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage general application settings.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <div className="space-y-2">
          <Label className="text-base">Appearance</Label>
          <p className="text-xs text-muted-foreground">
            Customize the look and feel of the application.
          </p>
        </div>

        <RadioGroup
          defaultValue={theme}
          onValueChange={(value) => setTheme(value)}
          className="grid max-w-md grid-cols-3 gap-4"
        >
         {[{
            label : "dark",
            icon : <RiMoonLine className="mb-3 h-6 w-6"/>
         },
         {
            label : "light",
            icon : <RiSunLine className="mb-3 h-6 w-6"/>
         },
         {
            label : "system",
            icon : <RiComputerLine className="mb-3 h-6 w-6"/>
         }
         ].map((i) => (
          <div>
            <RadioGroupItem value={i.label} id={i.label} className="peer sr-only" />
            <Label
              htmlFor={i.label}
              className={
                cn(theme === i.label ? "dark:border-primary/80 border-primary/50" : "border-muted",
                  "flex flex-col items-center justify-between rounded-lg border-2 bg-card p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-700")}
            >
              {i.icon}
              {i.label}
            </Label>
          </div>
         ))} 
        </RadioGroup>
      </div>
    </div>
  )
}
