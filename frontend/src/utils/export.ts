/**
 * Utility for exporting data to CSV format with UTF-8 BOM encoding
 * Supports Excel compatibility with Khmer and international characters
 */

export interface ExportColumn<T> {
  label: string;
  key: keyof T | ((row: T, index?: number) => string | number | null | undefined);
}

export function exportToCsv<T>(filename: string, columns: ExportColumn<T>[], data: T[]): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Header row
  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataRows = data.map((row, index) => {
    return columns
      .map((col) => {
        let value: any = '';
        if (typeof col.key === 'function') {
          value = col.key(row, index);
        } else if (typeof row === 'object' && row !== null && col.key in row) {
          value = (row as Record<string, any>)[col.key as string];
        }

        if (value === null || value === undefined) {
          value = '';
        }

        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
