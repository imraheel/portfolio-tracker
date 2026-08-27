import { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

interface MarkdownEditorProps {
  isDarkMode?: boolean;
}

const DOC_ID = 'main';
const COLLECTION = 'notes';

export default function MarkdownEditor({ isDarkMode = false }: MarkdownEditorProps) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const docRef = doc(db, COLLECTION, DOC_ID);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          setContent(data.content || '');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    setStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      const docRef = doc(db, COLLECTION, DOC_ID);
      await setDoc(docRef, {
        content: value,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setStatus('saved');
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
        <span className="text-xs font-medium text-[var(--text-secondary)]">Markdown Editor</span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : ''}
        </span>
      </div>
      <div className="flex-1">
        <AceEditor
          mode="markdown"
          theme={isDarkMode ? 'monokai' : 'github'}
          onChange={handleChange}
          value={content}
          name="markdown-editor"
          width="100%"
          height="100%"
          fontSize={14}
          showPrintMargin={false}
          wrapEnabled
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
          }}
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
    </div>
  );
}
