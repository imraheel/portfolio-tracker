import { useState, useCallback } from 'react';
import * as dataService from '@/services/data';

export function useDataExport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const exportData = useCallback(async () => {
    setExporting(true);
    try {
      const result = await dataService.exportDataAsJson();
      return result;
    } finally {
      setExporting(false);
    }
  }, []);

  const importData = useCallback(async (jsonString: string) => {
    setImporting(true);
    try {
      const result = await dataService.importDataFromJson(jsonString);
      return result;
    } finally {
      setImporting(false);
    }
  }, []);

  return {
    exporting,
    importing,
    exportData,
    importData,
  };
}
