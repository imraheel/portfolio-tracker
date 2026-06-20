import { useState } from 'react';
import { toast } from 'sonner';
import { Download, AlertTriangle, FileJson, Database, RotateCcw } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';

export default function Settings() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Backup & Recovery</h2>
        <p className="text-[12px] text-[var(--text-muted)]">Manage your data portability</p>
      </div>

      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">Export</span>
        </div>
        <div className="p-5">
          <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-1">Export Master Data</h3>
          <p className="text-[12px] text-[var(--text-secondary)] mb-4">
            Download all your data (Stocks, Deposits, Transactions, Dividends) into a single master backup file.
          </p>
          <ExportButton />
        </div>
      </div>

      <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--accent-red)]" />
          <span className="text-[13px] font-semibold text-[var(--accent-red)]">Import</span>
        </div>
        <div className="p-5">
          <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-1">Restore Master Data</h3>
          <div className="mb-4 p-3 rounded-lg bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-red)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-[var(--accent-red)]">Warning: Destructive Action</p>
              <p className="text-[12px] text-[var(--text-secondary)]">This will permanently erase your current database.</p>
            </div>
          </div>
          <ImportForm />
        </div>
      </div>
    </div>
  );
}

function ExportButton() {
  const { exportData, exporting } = useDataExport();
  const handleExport = async () => {
    const result = await exportData();
    if (result.success && result.data && result.filename) {
      toast.success('Backup file generated successfully!');
      const blob = new Blob([result.data], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.href) URL.revokeObjectURL(link.href);
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
      className="h-[30px] px-4 rounded-[6px] bg-[var(--accent-blue)] text-white text-[12px] font-medium hover:bg-[var(--accent-blue-dark)] disabled:opacity-50 flex items-center gap-1.5"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{exporting ? 'Generating...' : 'Download Backup'}</span>
    </button>
  );
}

function ImportForm() {
  const { importData, importing } = useDataExport();
  const [file, setFile] = useState<File | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a backup file.'); return; }
    if (!window.confirm('This will permanently delete all current data. Are you sure?')) return;
    try {
      const text = await file.text();
      const result = await importData(text);
      if (result.success) { toast.success(result.message); setTimeout(() => { window.location.href = '/'; }, 1000); }
      else { toast.error(`Import failed: ${result.message}`); }
    } catch { toast.error('Failed to read file.'); }
  };

  return (
    <form onSubmit={handleImport}>
      <div className="flex items-center gap-3 mb-4">
        <FileJson className="w-6 h-6 text-[var(--accent-blue)]" />
        <input type="file" accept=".txt,.json" onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-[12px] text-[var(--text-secondary)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--accent-blue)] file:py-1.5 file:px-3 file:text-[12px] file:font-medium file:text-white hover:file:bg-[var(--accent-blue-dark)]" />
      </div>
      <button type="submit" disabled={importing}
        className="h-[30px] px-4 rounded-[6px] bg-[var(--accent-red)] text-white text-[12px] font-medium hover:bg-[var(--accent-red-light)] disabled:opacity-50 flex items-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{importing ? 'Restoring...' : 'Restore from Backup'}</span>
      </button>
    </form>
  );
}
