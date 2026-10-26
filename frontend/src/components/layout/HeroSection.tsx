import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { ArrowRight, Mic } from "lucide-react"

interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  subtitle: string
  primaryActionText?: string
  secondaryActionText?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

export function HeroSection({
  title,
  subtitle,
  primaryActionText = "Get Started",
  secondaryActionText = "Try Voice Assistant",
  onPrimaryAction,
  onSecondaryAction,
  className,
  ...props
}: HeroSectionProps) {
  return (
    <section 
      className={cn("relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-16", className)} 
      {...props}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-foreground leading-tight mb-6">
          {title.split(' ').map((word, i) => (
            i % 3 === 0 ? <span key={i} className="text-primary">{word} </span> : <span key={i}>{word} </span>
          ))}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={onPrimaryAction} className="w-full sm:w-auto group">
            {primaryActionText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" onClick={onSecondaryAction} className="w-full sm:w-auto">
            <Mic className="mr-2 h-4 w-4" />
            {secondaryActionText}
          </Button>
        </div>
      </div>
    </section>
  )
}
