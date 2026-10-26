import * as React from "react"
import { Building2 } from "lucide-react"

export function GovBanner() {
  return (
    <div className="w-full bg-muted/50 border-b border-border py-1.5 px-4 text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-2">
      <Building2 className="h-3.5 w-3.5" />
      <span>An official website of the Government of India</span>
    </div>
  )
}
