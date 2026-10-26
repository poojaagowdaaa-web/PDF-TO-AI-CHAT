import { Show, UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-xl md:text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hover:from-primary hover:to-primary/70 transition-all"
        >
          PDF to Chat
        </Link>

        <Show when="signed-in">
          <div className="flex items-center gap-3 md:gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/upload" aria-label="Upload document">
                <Plus className="h-4 w-4" />
                Upload
              </Link>
            </Button>
            <ThemeToggle />
            <UserButton />
          </div>
        </Show>
      </div>
    </header>
  );
}

export default Header;
