import { motion } from "framer-motion";
import { Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 px-6 flex items-center justify-between border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">Ome<span className="text-primary">Clone</span></span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Community Safety</h1>
            <p className="text-muted-foreground">Your safety is our top priority.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Safety Guidelines
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  OmeClone is designed for fun, spontaneous, and safe connections. To keep our community positive, we enforce strict rules:
                </p>
                <ul className="grid gap-3">
                  {[
                    "Must be 18 years or older to use the service.",
                    "No harassment, bullying, or hate speech.",
                    "No sexually explicit content or nudity.",
                    "No sharing of private information (doxing).",
                    "Illegal activities are strictly prohibited."
                  ].map((rule, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-bold">How to Stay Safe</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <h4 className="font-bold text-sm mb-2 text-foreground">Stay Anonymous</h4>
                    <p className="text-xs text-muted-foreground">Don't share your name, location, or social media handles with strangers.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border">
                    <h4 className="font-bold text-sm mb-2 text-foreground">Use Reporting</h4>
                    <p className="text-xs text-muted-foreground">If someone violates rules, use the report button immediately. We review all reports.</p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
