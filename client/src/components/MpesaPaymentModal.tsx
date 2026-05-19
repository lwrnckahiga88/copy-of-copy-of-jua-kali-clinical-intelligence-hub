import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Phone, DollarSign, Zap } from "lucide-react";

interface MpesaPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_TIERS = [
  { amount: 5, credits: 100, label: "Starter" },
  { amount: 29, credits: 1000, label: "Pro" },
  { amount: 99, credits: 5000, label: "Enterprise" },
];

export function MpesaPaymentModal({ open, onOpenChange }: MpesaPaymentModalProps) {
  const [step, setStep] = useState<"select" | "payment" | "confirm">("select");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedTier, setSelectedTier] = useState<typeof PAYMENT_TIERS[0] | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initiateSTKPush = trpc.payment.initiateSTKPush.useMutation();
  const confirmPayment = trpc.payment.confirmPayment.useMutation();

  const handleSelectTier = (tier: typeof PAYMENT_TIERS[0]) => {
    setSelectedTier(tier);
    setStep("payment");
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || !selectedTier) return;

    setLoading(true);
    try {
      const result = await initiateSTKPush.mutateAsync({
        phoneNumber,
        amount: selectedTier.amount,
        credits: selectedTier.credits,
      });

      setTransactionId(result.transactionId);
      toast.success(result.message);
      setStep("confirm");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!transactionId || !selectedTier) return;

    setLoading(true);
    try {
      const result = await confirmPayment.mutateAsync({
        transactionId,
      });

      if (result.success) {
        toast.success(`${result.creditsAdded} credits added to your account!`);
        onOpenChange(false);
        // Reset form
        setStep("select");
        setPhoneNumber("");
        setSelectedTier(null);
        setTransactionId(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Top Up Credits
          </DialogTitle>
          <DialogDescription>
            Add credits to your account using M-Pesa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "select" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose a plan that works for you:
              </p>
              {PAYMENT_TIERS.map((tier) => (
                <Card
                  key={tier.label}
                  className="p-4 cursor-pointer border-border/50 hover:border-accent/50 transition-colors"
                  onClick={() => handleSelectTier(tier)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{tier.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {tier.credits} credits
                      </div>
                    </div>
                    <div className="text-lg font-bold text-accent">
                      ${tier.amount}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {step === "payment" && selectedTier && (
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${selectedTier.amount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-semibold text-accent">{selectedTier.credits}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your M-Pesa registered phone number
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleInitiatePayment}
                  disabled={!phoneNumber || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay ${selectedTier.amount}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && selectedTier && (
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  A payment prompt has been sent to your phone
                </p>
                <p className="font-semibold">
                  Please enter your M-Pesa PIN to complete the payment
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <div className="font-mono text-xs mt-1 break-all">{transactionId}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleConfirmPayment()}
                  disabled={loading}
                >
                  Payment Failed
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={() => handleConfirmPayment()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Payment Successful"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
