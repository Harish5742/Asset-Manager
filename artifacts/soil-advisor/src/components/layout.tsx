import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Sprout, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from "@/hooks/use-language";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { href: "/", label: t.navNewAnalysis, icon: Sprout },
    { href: "/admin", label: t.navDashboard, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 max-w-6xl items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 mr-6 text-primary transition-colors hover:text-primary/80">
            <div className="bg-primary/10 p-2 rounded-full">
              <Sprout className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Mitti Advisor
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-6 mt-6">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col container max-w-6xl mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
