import { Calculator } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import MarkdownEditor from './MarkdownEditor';
import CalculatorComponent from './Calculator';
import { useTheme } from '@/hooks/useTheme';

export default function Notes() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 h-full">
        <div className="lg:col-span-7">
          <Card padding="none" className="h-full overflow-hidden">
            <MarkdownEditor isDarkMode={isDarkMode} />
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card padding="none" className="h-full overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
              <Calculator className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">Calculator</span>
            </div>
            <CalculatorComponent />
          </Card>
        </div>
      </div>
    </div>
  );
}
