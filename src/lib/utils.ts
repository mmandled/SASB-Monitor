// src\lib\utils.ts
export function formatDate(isoDateString?: string | null): string {
  if (!isoDateString) return "No due date";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

export function formatSyncTimestamp(isoDateString?: string | null): string {
  if (!isoDateString) return "Not synced yet";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "Unknown";
    const datePart = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  } catch {
    return "Unknown";
  }
}

export function getAvatarBgColor(name: string): string {
  const colors = [
    "bg-blue-600",
    "bg-indigo-600",
    "bg-sky-600",
    "bg-cyan-700",
    "bg-blue-700",
    "bg-slate-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function exportToCSV(
  filename: string,
  rows: Record<string, any>[],
): void {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val =
            row[header] === null || row[header] === undefined
              ? ""
              : String(row[header]);
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
