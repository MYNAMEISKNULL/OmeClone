import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useReportUser() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reason: string) => {
      const res = await fetch(api.reports.create.path, {
        method: api.reports.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to report");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep the community safe.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not submit report. Please try again.",
        variant: "destructive",
      });
    }
  });
}
