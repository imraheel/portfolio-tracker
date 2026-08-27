import { useState, useCallback, useEffect, useRef } from 'react';
import CalculatorHistory, { type HistoryEntry } from './CalculatorHistory';

const STORAGE_KEY = 'calculator-history';

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function sanitizeInput(input: string): boolean {
  return /^[0-9+\-*/.%() ]+$/.test(input);
}

function calculate(expression: string): string {
  try {
    const sanitized = expression.replace(/%/g, '/100');
    if (!sanitizeInput(sanitized)) return 'Error';
    // eslint-disable-next-line no-eval
    const result = eval(sanitized);
    if (typeof result !== 'number' || !isFinite(result)) return 'Error';
    return Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');
  } catch {
    return 'Error';
  }
}

const BUTTON_ROWS = [
  ['C', '(', ')', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['%', '0', '.', '='],
];

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [justEvaluated, setJustEvaluated] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const handleButton = useCallback((btn: string) => {
    if (btn === 'C') {
      setDisplay('0');
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (btn === '=') {
      if (!expression) return;
      const result = calculate(expression);
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        expression: expression,
        result: result,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev]);
      setDisplay(result);
      setExpression(result === 'Error' ? '' : result);
      setJustEvaluated(true);
      return;
    }

    if (justEvaluated && /[0-9]/.test(btn)) {
      setDisplay(btn);
      setExpression(btn);
      setJustEvaluated(false);
      return;
    }

    setJustEvaluated(false);
    const newExpression = expression + btn;
    setExpression(newExpression);
    setDisplay(newExpression);
  }, [expression, justEvaluated]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleButton(key);
      } else if (['+', '-', '*', '/', '%'].includes(key)) {
        e.preventDefault();
        handleButton(key);
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleButton(key);
      } else if (key === '.') {
        e.preventDefault();
        handleButton('.');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleButton('=');
      } else if (key === 'Escape') {
        e.preventDefault();
        handleButton('C');
      } else if (key === 'Backspace') {
        e.preventDefault();
        setExpression((prev) => {
          const next = prev.slice(0, -1);
          setDisplay(next || '0');
          return next;
        });
        setJustEvaluated(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButton, isFocused]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="flex flex-col h-full outline-none"
    >
      <div className="p-3 border-b border-[var(--border-subtle)]">
        <div className="text-right mb-2">
          <div className="text-[10px] text-[var(--text-muted)] font-mono h-4 truncate">
            {expression || '\u00A0'}
          </div>
          <div className="text-lg font-semibold text-[var(--text-primary)] font-mono truncate">
            {display}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {BUTTON_ROWS.flat().map((btn) => (
            <button
              key={btn}
              tabIndex={-1}
              onClick={() => handleButton(btn)}
              className={`
                h-9 rounded text-sm font-medium transition-colors
                ${btn === '=' ? 'bg-[var(--accent-blue)] text-white hover:opacity-90' : ''}
                ${btn === 'C' ? 'bg-[var(--accent-red)] text-white hover:opacity-90' : ''}
                ${btn === 'C' || btn === '=' ? '' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-default)]'}
              `}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <CalculatorHistory history={history} onClear={clearHistory} />
      </div>
    </div>
  );
}
