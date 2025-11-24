import { ArrowRight, FileQuestionMark, FileUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

type Feature = {
  name: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    name: "Upload PDF",
    description:
      "Upload PDF documents of varying sizes and structures with ease.",
    icon: <FileUp className="w-6 h-6" />,
  },
  {
    name: "Ask Questions",
    description: "Ask complex, context-aware questions in natural language.",
    icon: <FileQuestionMark className="w-6 h-6" />,
  },
  {
    name: "Get Answers",
    description:
      "Receive accurate, verifiable answers, drastically improving information retrieval efficiency.",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-background overflow-hidden lg:overflow-y-auto">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shrink-0">
        <div className="w-full flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hover:from-primary hover:to-primary/70 transition-all"
          >
            PDF to Chat
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 md:py-12 lg:py-6 gap-6 md:gap-8 lg:gap-8 max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium border border-border shrink-0">
            <Sparkles className="w-4 h-4" />
            <span>Unlocking Document Intelligence</span>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 lg:gap-3 text-center shrink-0">
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ask Questions Based On Your PDF
              <br />
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Interactively
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-base xl:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Upload PDF documents of varying sizes and structures. Ask complex,
              context-aware questions in natural language. Receive accurate,
              verifiable answers, drastically improving information retrieval
              efficiency.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Button asChild variant="default" size="lg" className="group">
              <Link href="/dashboard" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <div
            id="features"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-4 w-full pt-4 md:pt-8 lg:pt-4 pb-8 md:pb-12 lg:pb-6"
          >
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative p-5 md:p-6 lg:p-5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex flex-col gap-3 md:gap-4 lg:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-10 lg:h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1.5 md:gap-2 lg:gap-1.5">
                    <h3 className="text-lg md:text-xl lg:text-lg font-semibold text-foreground">
                      {feature.name}
                    </h3>
                    <p className="text-sm md:text-base lg:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
