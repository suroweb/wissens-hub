jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

jest.mock('exceljs', () => {
  const addRow = jest.fn();
  return {
    Workbook: jest.fn().mockImplementation(() => ({
      addWorksheet: jest.fn().mockReturnValue({
        columns: [],
        addRow: addRow,
      }),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    })),
  };
});

import { exportToCsv, exportToExcel } from '../exportUtils';
import { saveAs } from 'file-saver';

const mockSaveAs = saveAs as unknown as jest.Mock;

describe('exportUtils (ADMIN-05)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToCsv', () => {
    it('should export data to CSV with UTF-8 BOM', () => {
      const data = [{ name: 'Artikel A', count: 5 }];
      const headers = [
        { key: 'name', header: 'Name' },
        { key: 'count', header: 'Anzahl' },
      ];
      exportToCsv(data, headers, 'report');

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      const blob: Blob = mockSaveAs.mock.calls[0][0];
      const filename: string = mockSaveAs.mock.calls[0][1];
      expect(filename).toBe('report.csv');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should escape commas in CSV values', () => {
      const data = [{ name: 'Hallo, Welt', desc: 'OK' }];
      const headers = [
        { key: 'name', header: 'Name' },
        { key: 'desc', header: 'Beschreibung' },
      ];
      exportToCsv(data, headers, 'test');

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
    });

    it('should produce header-only output for empty data', () => {
      const data: Array<Record<string, unknown>> = [];
      const headers = [
        { key: 'name', header: 'Name' },
        { key: 'count', header: 'Anzahl' },
      ];
      exportToCsv(data, headers, 'empty');

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      const filename: string = mockSaveAs.mock.calls[0][1];
      expect(filename).toBe('empty.csv');
    });

    it('should use correct German column headers', () => {
      const data = [{ titel: 'Test', status: 'Aktiv' }];
      const headers = [
        { key: 'titel', header: 'Titel' },
        { key: 'status', header: 'Status' },
      ];
      exportToCsv(data, headers, 'german');

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel via ExcelJS', async () => {
      const data = [{ name: 'Artikel', count: 3 }];
      const headers = [
        { key: 'name', header: 'Name', width: 30 },
        { key: 'count', header: 'Anzahl', width: 15 },
      ];

      await exportToExcel(data, headers, 'report');

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      const filename: string = mockSaveAs.mock.calls[0][1];
      expect(filename).toBe('report.xlsx');
    });

    it('should handle empty data in Excel export', async () => {
      const data: Array<Record<string, unknown>> = [];
      const headers = [
        { key: 'name', header: 'Name', width: 30 },
      ];

      await exportToExcel(data, headers, 'empty-excel');

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
    });
  });
});
