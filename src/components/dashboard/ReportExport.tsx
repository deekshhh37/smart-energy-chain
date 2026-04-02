import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportExportProps {
  onExportCSV: () => void;
  onPrint: () => void;
  label?: string;
}

export function ReportExport({ onExportCSV, onPrint, label = "Export Report" }: ReportExportProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint} className="gap-2 cursor-pointer">
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
