import { Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-foreground tracking-tighter leading-none">iMotors</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Consultant</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          <Link to="/" className="text-foreground/60 hover:text-foreground transition-colors">Home</Link>
          <Link to="/consultancy" className="text-foreground/60 hover:text-foreground transition-colors">Consultoria</Link>
          <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">Sobre o TCO</a>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link 
            to="/consultancy" 
            className="hidden sm:flex items-center justify-center px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold hover:scale-105 transition-transform"
          >
            Começar Agora
          </Link>
        </div>
      </div>
    </header>
  );
}
