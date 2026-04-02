import { useState } from "react";
import { Upload, Loader2, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function EnergyDataUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    month: "",
    year: new Date().getFullYear().toString(),
    consumption_kwh: "",
    solar_kwh: "",
    grid_kwh: "",
    bill_amount: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.month) return;

    setLoading(true);
    setSuccess(false);

    const { error } = await supabase.from("energy_uploads").insert({
      uploaded_by: user.id,
      month: form.month,
      year: parseInt(form.year),
      consumption_kwh: parseFloat(form.consumption_kwh) || 0,
      solar_kwh: parseFloat(form.solar_kwh) || 0,
      grid_kwh: parseFloat(form.grid_kwh) || 0,
      bill_amount: parseFloat(form.bill_amount) || 0,
      notes: form.notes || null,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Data Uploaded", description: `${form.month} ${form.year} energy data saved successfully.` });
      setForm({ month: "", year: new Date().getFullYear().toString(), consumption_kwh: "", solar_kwh: "", grid_kwh: "", bill_amount: "", notes: "" });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Monthly Energy Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                min={2020}
                max={2030}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Consumption (kWh)</Label>
              <Input
                type="number"
                placeholder="e.g. 40321"
                value={form.consumption_kwh}
                onChange={(e) => setForm({ ...form, consumption_kwh: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Solar Generation (kWh)</Label>
              <Input
                type="number"
                placeholder="e.g. 14400"
                value={form.solar_kwh}
                onChange={(e) => setForm({ ...form, solar_kwh: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grid Usage (kWh)</Label>
              <Input
                type="number"
                placeholder="e.g. 25921"
                value={form.grid_kwh}
                onChange={(e) => setForm({ ...form, grid_kwh: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bill Amount (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 369496"
                value={form.bill_amount}
                onChange={(e) => setForm({ ...form, bill_amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any remarks about this month's data..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading || !form.month} className="w-full gradient-primary hover:opacity-90">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
            ) : success ? (
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Uploaded Successfully</span>
            ) : (
              <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Data</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
