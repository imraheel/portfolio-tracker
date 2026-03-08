import { useState } from 'react';
import { toast } from 'sonner';
import { Download, AlertTriangle, FileJson, Database, RotateCcw } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

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
      className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4">
                <label htmlFor="import-file" className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Select Master Backup File
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <FileJson className="h-8 w-8 text-[var(--accent-gold)]" />
                  <input 
                      type="file" 
                      id="import-file"
                      accept=".txt,.json"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--accent-gold)] file:py-2 file:px-4 file:text-sm file:font-medium file:text-[var(--bg-primary)] hover:file:bg-[var(--accent-gold-light)] cursor-pointer"
                  />
                </div>
            </div>
            
            <button 
                type="submit" 
                disabled={importing}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-coral)] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--accent-coral-light)] disabled:opacity-50"
            >
                <RotateCcw className="h-4 w-4" />
                <span>{importing ? 'Restoring Data...' : 'Restore from Backup'}</span>
            </button>
        </form>
    )
}


export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Backup & Recovery"
        description="Manage your data portability with a single master backup file."
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 gap-6">
        <section>
          <Card hover>
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-6 py-4">
              <Database className="h-4 w-4 text-[var(--accent-gold)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                Export
              </span>
            </div>
            <div className="p-6">
                <h2 className="font-display text-lg text-[var(--text-primary)] mb-2">Export Master Data</h2>
                <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Download all your data (Stocks, Deposits, Transactions, Dividends) into a single master backup file. 
                    This file can be used to restore your entire portfolio on any instance of PSIT.
                </p>
                <ExportButton />
            </div>
          </Card>
        </section>

        <section>
          <Card hover>
            <div className="flex items-center gap-2 border-b border-[var(--accent-coral)]/20 bg-[var(--accent-coral)]/10 px-6 py-4">
                <AlertTriangle className="h-4 w-4 text-[var(--accent-coral)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-coral)]">
                  Import
                </span>
            </div>
            <div className="p-6">
                <h2 className="font-display text-lg text-[var(--text-primary)] mb-2">Restore Master Data</h2>
                <div className="mb-6 rounded-lg border border-[var(--accent-coral)]/20 bg-[var(--accent-coral)]/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[var(--accent-coral)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[var(--accent-coral)] mb-1">Warning: Destructive Action</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Restoring data will permanently erase your current database. This process cannot be undone.
                        </p>
                      </div>
                    </div>
                </div>
                <ImportForm />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
