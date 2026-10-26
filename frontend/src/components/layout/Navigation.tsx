import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { GovEmblem } from "../custom/GovEmblem"

interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  logoText?: string
  links?: { label: string; href: string }[]
  onLoginClick?: () => void
  onRegisterClick?: () => void
}

export function Navigation({
  className,
  logoText = "GramAI",
  links = [],
  onLoginClick,
  onRegisterClick,
  ...props
}: NavigationProps) {
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)} {...props}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
        <div className="flex items-center gap-3">
          <GovEmblem size="sm" />
          <span className="text-xl font-bold font-heading tracking-tight text-primary">{logoText}</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {onLoginClick && (
            <Button variant="ghost" size="sm" onClick={onLoginClick}>
              Log In
            </Button>
          )}
          {onRegisterClick && (
            <Button variant="default" size="sm" onClick={onRegisterClick}>
              Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
