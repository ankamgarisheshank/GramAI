import * as React from "react"
import { cn } from "../../lib/utils"
import { GovEmblem } from "../custom/GovEmblem"

interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer className={cn("border-t bg-muted/20 py-8 md:py-12", className)} {...props}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <GovEmblem size="md" />
              <span className="text-xl font-bold font-heading tracking-tight text-primary">GramAI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering rural India through AI-driven scheme discovery and conversational assistance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Farmer Schemes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Student Scholarships</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Senior Pensions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Voice Assistant</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GramAI Initiative. All rights reserved.</p>
          <p>Designed for Accessibility and Inclusion.</p>
        </div>
      </div>
    </footer>
  )
}
