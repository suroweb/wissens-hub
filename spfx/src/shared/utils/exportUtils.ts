import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportToExcel(
  data: Array<Record<string, unknown>>,
  headers: { key: string; header: string; width: number }[],
  filename: string
): Promise<void> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Bericht');

  worksheet.columns = headers.map(h => ({
    header: h.header,
    key: h.key,
    width: h.width,
  }));

  for (let i = 0; i < data.length; i++) {
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].key] = data[i][headers[j].key];
    }
    worksheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename + '.xlsx');
}

function escapeCSVValue(value: unknown): string {
  const str = value === undefined || value === null ? '' : String(value); // eslint-disable-line @rushstack/no-new-null
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function exportToCsv(
  data: Array<Record<string, unknown>>,
  headers: { key: string; header: string }[],
  filename: string
): void {
  const headerLine = headers.map(h => escapeCSVValue(h.header)).join(',');
  const lines: string[] = [headerLine];

  for (let i = 0; i < data.length; i++) {
    const values: string[] = [];
    for (let j = 0; j < headers.length; j++) {
      values.push(escapeCSVValue(data[i][headers[j].key]));
    }
    lines.push(values.join(','));
  }

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename + '.csv');
}
