import Link from "next/link";
import { Activity, History, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            SpeedTest
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-slate-400"}`}
          >
            <Activity className="h-4 w-4" />
            Test
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/history") ? "text-primary" : "text-slate-400"}`}
          >
            <History className="h-4 w-4" />
            History
          </Link>
          <Link
            href="/profile"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/profile") ? "text-primary" : "text-slate-400"}`}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
