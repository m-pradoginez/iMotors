import { type ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="py-8 border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground">iMotors</span>
            <span>© 2024 — Consultoria Automotiva</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Dados: FIPE & INMETRO</span>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
