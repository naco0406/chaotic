import type { FC, HTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import React from 'react';

interface MarkdownPreviewProps {
  content: string;
}

interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

const syntaxTheme = oneDark as unknown as { [key: string]: React.CSSProperties };

const CodeBlock = ({ inline, className, children, style, ...props }: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={syntaxTheme}
      language={match[1]}
      PreTag="div"
      className="rounded-lg"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
      <code
        className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-700"
        style={style}
        {...props}
      >
        {children}
      </code>
    );
};

const components: Components = {
  code: CodeBlock as Components['code'],
};

export const MarkdownPreview: FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <div className="w-full h-full p-4 rounded-2xl bg-white cute-shadow overflow-auto">
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content || '*미리보기가 여기에 표시됩니다*'}
        </ReactMarkdown>
      </div>
    </div>
  );
};
