"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReceiptData } from "@/components/shared/pdf/receiptDocument";

interface DownloadReceiptButtonProps {
  data: ReceiptData;
  className?: string;
}

export function DownloadReceiptButton({ data, className }: DownloadReceiptButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      
      const [{ pdf }, { ReceiptDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/shared/pdf/receiptDocument"),
      ]);

      const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `zeek-receipt-${data.orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate receipt PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      variant="outline"
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" /> Download Receipt
        </>
      )}
    </Button>
  );
}