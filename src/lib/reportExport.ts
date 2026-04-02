// CSV export utility
export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") ? `"${val}"` : val;
      }).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Simple PDF-like text report (prints via browser)
export function printReport(title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const content = document.querySelector("main")?.innerHTML ?? "";
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0fdfa; color: #0d9488; }
        .no-print { display: none; }
        @media print { button, .no-print { display: none; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      ${content}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
