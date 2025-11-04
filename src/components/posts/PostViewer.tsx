import type { CSSProperties, FC, HTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Post } from '../../types/post';

interface PostViewerProps {
  post: Post;
}

interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

type SyntaxTheme = Record<string, CSSProperties>;
const syntaxTheme = oneDark as SyntaxTheme;

const CodeBlock = ({ inline, className, children, style: _style, ...props }: CodeBlockProps) => {
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
        className="bg-purple-100 px-1 py-0.5 rounded text-purple-700"
        {...props}
      >
      {children}
    </code>
  );
};

const markdownComponents: Components = {
  code: CodeBlock as Components['code'],
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-purple-700 mt-6 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-purple-600 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
  ),
  li: ({ children }) => <li className="text-gray-700">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-purple-300 pl-4 italic text-gray-600 my-4">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-purple-600 hover:text-purple-800 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
} satisfies Components;

export const PostViewer: FC<PostViewerProps> = ({ post }) => {
  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-purple max-w-none">
      <header className="mb-8 pb-4 border-b border-purple-100">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          {post.title}
        </h1>
        <time className="text-sm text-gray-500">{date}</time>
      </header>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {post.content}
      </ReactMarkdown>
    </article>
  );
};
