import { motion } from "framer-motion";
import { Shield, Lock, Info, ChevronRight, ArrowLeft, MessageSquare, Mail, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function InfoPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("safety");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["safety", "terms", "privacy", "feedback", "contact"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Your message has been sent. Thank you for your feedback!",
    });
  };

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
            <h1 className="text-4xl font-bold tracking-tight">Support & Legal</h1>
            <p className="text-muted-foreground">Everything you need to know about OmeClone.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50 p-1">
              <TabsTrigger value="safety" className="gap-2 text-xs sm:text-sm">
                <Shield className="w-4 h-4" />
                Safety
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2 text-xs sm:text-sm">
                <Heart className="w-4 h-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2 text-xs sm:text-sm">
                <Mail className="w-4 h-4" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="terms" className="gap-2 text-xs sm:text-sm">
                <Info className="w-4 h-4" />
                Terms
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2 text-xs sm:text-sm">
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

              <TabsContent value="feedback">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <section className="space-y-4 text-center">
                      <h3 className="text-xl font-bold">We love your feedback!</h3>
                      <p className="text-muted-foreground">Help us make OmeClone better for everyone.</p>
                      <form onSubmit={handleSubmit} className="space-y-4 text-left max-w-md mx-auto">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">How would you rate your experience?</label>
                          <div className="flex gap-2 justify-center py-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <Button key={num} type="button" variant="outline" className="w-10 h-10 p-0 rounded-full hover:border-primary hover:text-primary">
                                {num}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Any suggestions or issues?</label>
                          <textarea 
                            className="w-full min-h-[100px] p-3 rounded-lg bg-muted/30 border border-border focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Tell us what you think..."
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Submit Feedback</Button>
                      </form>
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardContent className="pt-6 space-y-6 text-center">
                    <section className="space-y-4 max-w-md mx-auto">
                      <h3 className="text-xl font-bold">Get in Touch</h3>
                      <p className="text-muted-foreground">For business inquiries, legal matters, or urgent support.</p>
                      <div className="grid gap-4 pt-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border text-left">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">General Support</h4>
                            <p className="text-xs text-muted-foreground">support@omeclone.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border text-left">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">Safety & Legal</h4>
                            <p className="text-xs text-muted-foreground">legal@omeclone.com</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 text-xs text-muted-foreground">
                        We typically respond to inquiries within 24-48 business hours.
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
