import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Upload, AlertTriangle, FileJson } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';

function ExportButton() {
  const { exportData, exporting } = useDataExport();

  const handleExport = async () => {
    const result = await exportData();

    if (result.success && result.data && result.filename) {
      toast.success('Backup file generated successfully!');
      const blob = new Blob([result.data], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.href) {
        URL.revokeObjectURL(link.href);
      }
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error(`Export failed: ${result.message}`);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center space-x-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      <span>{exporting ? 'Generating Backup...' : 'Download Master Backup (.txt)'}</span>
    </button>
  );
}

function ImportForm() {
    const { importData, importing } = useDataExport();
    const [file, setFile] = useState<File | null>(null);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a backup file to import.');
            return;
        }

        if (!window.confirm('CRITICAL WARNING: This action will permanently delete all current data and replace it with the content of this backup. Are you sure?')) {
            return;
        }

        try {
            const text = await file.text();
            const result = await importData(text);

            if (result.success) {
                toast.success(result.message);
                setTimeout(() => {
                    window.location.href = '/'; 
                }, 1000);
            } else {
                toast.error(`Import failed: ${result.message}`);
            }
        } catch {
            toast.error('Failed to read the selected file.');
        }
    };

    return (
        <form onSubmit={handleImport} className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <label htmlFor="import-file" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Select Master Backup File
                </label>
                <div className="mt-2 flex items-center space-x-3">
                  <FileJson className="h-8 w-8 text-blue-500" />
                  <input 
                      type="file" 
                      id="import-file"
                      accept=".txt,.json"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:py-2 file:px-4 file:text-sm file:font-bold file:text-white hover:file:bg-blue-700 shadow-sm"
                  />
                </div>
            </div>
            
            <button 
                type="submit" 
                disabled={importing}
                className="inline-flex items-center space-x-2 rounded-md bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-50"
            >
                <Upload className="h-4 w-4" />
                <span>{importing ? 'Restoring Data...' : 'Restore from Backup'}</span>
            </button>
        </form>
    )
}


export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Backup & Recovery</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your data portability with a single master backup file.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">Export Master Data</h2>
            </div>
            <div className="p-6">
                <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    Download all your data (Stocks, Deposits, Transactions, Dividends) into a single master backup file. 
                    This file can be used to restore your entire portfolio on any instance of PSIT.
                </p>
                <ExportButton />
            </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-red-200 bg-white shadow-sm">
            <div className="flex items-center space-x-2 border-b border-red-100 bg-red-50 px-6 py-4 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-sm font-bold uppercase tracking-widest">Restore Master Data</h2>
            </div>
            <div className="p-6">
                <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-100">
                    <p className="font-bold mb-1 underline italic">Warning: Destructive Action</p>
                    Restoring data will permanently erase your current database. This process cannot be undone. 
                </div>
                <ImportForm />
            </div>
        </section>
      </div>
    </div>
  );
}
