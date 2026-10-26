import * as React from "react"
import { cn } from "../../lib/utils"

interface GovEmblemProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function GovEmblem({ className, size = "md", ...props }: GovEmblemProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className={cn("flex items-center justify-center rounded-full bg-background border shadow-sm p-1", sizeClasses[size], className)} {...props}>
      {/* Placeholder for the actual National Emblem of India. We use a stylized icon or image here usually. */}
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Government Emblem" className="object-contain w-full h-full opacity-90" />
    </div>
  )
}
