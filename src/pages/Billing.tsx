import { Download, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentBill, billingHistory } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

export default function Billing() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Billing & Payments
        </h1>
        <p className="text-muted-foreground mt-1">
          View your electricity bills and payment history
        </p>
      </div>

      {/* Current Bill Card */}
      <Card className="shadow-card mb-8 animate-fade-in overflow-hidden">
        <div className="gradient-primary p-6 text-primary-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Current Bill</p>
              <h2 className="text-3xl font-bold mt-1">₹{currentBill.totalAmount.toLocaleString()}</h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {currentBill.billingPeriod}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-primary-foreground/20 text-primary-foreground border-0"
              >
                <Clock className="w-3 h-3 mr-1" />
                {currentBill.status}
              </Badge>
              <p className="text-sm text-primary-foreground/80">
                Due: {currentBill.dueDate}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Units Consumed</p>
              <p className="text-xl font-semibold text-foreground">
                {currentBill.unitsConsumed.toLocaleString()} kWh
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost per Unit</p>
              <p className="text-xl font-semibold text-foreground">
                ₹{currentBill.costPerUnit}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solar Credits</p>
              <p className="text-xl font-semibold text-accent">
                {currentBill.solarCredits.toLocaleString()} kWh
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxes & Fees</p>
              <p className="text-xl font-semibold text-foreground">
                ₹{currentBill.taxes.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Blockchain Hash */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Blockchain Transaction Hash
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {currentBill.transactionHash}...verified on chain
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button className="gradient-primary hover:opacity-90 flex-1 sm:flex-initial">
              Pay Now
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-initial">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Units (kWh)</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.id}</TableCell>
                    <TableCell>{bill.month}</TableCell>
                    <TableCell>{bill.unitsConsumed.toLocaleString()}</TableCell>
                    <TableCell>₹{bill.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-accent/10 text-accent border-0"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {bill.transactionHash}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
