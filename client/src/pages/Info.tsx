import { motion } from "framer-motion";
import { Shield, Lock, Info, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function InfoPage() {
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
            <h1 className="text-4xl font-bold tracking-tight">Legal & Safety</h1>
            <p className="text-muted-foreground">Everything you need to know about staying safe and using OmeClone.</p>
          </div>

          <Tabs defaultValue="safety" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
              <TabsTrigger value="safety" className="gap-2">
                <Shield className="w-4 h-4" />
                Safety
              </TabsTrigger>
              <TabsTrigger value="terms" className="gap-2">
                <Info className="w-4 h-4" />
                Terms
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Lock className="w-4 h-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="safety">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Community Safety Guidelines
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
              </TabsContent>

              <TabsContent value="terms">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold">Terms of Service</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        By using OmeClone, you agree to these terms. Last updated: January 2026.
                      </p>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>1. <strong>Eligibility</strong>: You must be at least 18 years old. Use by minors is strictly prohibited.</p>
                        <p>2. <strong>User Content</strong>: You are solely responsible for the content you stream or share. We do not monitor all live content but will act on reports.</p>
                        <p>3. <strong>Prohibited Use</strong>: You may not use automated tools to access the service or disrupt the experience for others.</p>
                        <p>4. <strong>Termination</strong>: We reserve the right to ban users who violate our community guidelines without notice.</p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Privacy Policy
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your privacy is our priority. Since we are an anonymous service, we collect as little data as possible.
                      </p>
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p><strong>Video & Audio</strong>: We do not record or store your video or audio chats. They are peer-to-peer (P2P).</p>
                        <p><strong>Reports</strong>: When you report a user, we may store a temporary snapshot of the connection metadata to help us investigate and block the offender.</p>
                        <p><strong>Cookies</strong>: We use minimal local storage to manage your connection session. No tracking cookies are used.</p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
