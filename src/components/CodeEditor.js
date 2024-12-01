import React from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';

export const CodeEditor = ({ value, onChange, language = 'javascript' }) => {
  const theme = useTheme();
  
  return (
    <Editor
      height="300px"
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={onChange}
      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 21,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
};
