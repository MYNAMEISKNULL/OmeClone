import { motion } from "framer-motion";
import { Mail, Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
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
            <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
            <p className="text-muted-foreground">We're here to help with any questions or concerns.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-8 text-center">
              <div className="grid gap-6 max-w-md mx-auto">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">General Support</h4>
                    <p className="text-sm text-muted-foreground">support@omeclone.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/30 border text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Safety & Legal</h4>
                    <p className="text-sm text-muted-foreground">legal@omeclone.com</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
                Our support team is available Monday through Friday.<br />
                We typically respond within 24-48 business hours.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
