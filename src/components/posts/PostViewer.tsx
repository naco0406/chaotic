import { memo, useState } from 'react';
import type { FC, HTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import React from 'react';
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

interface MarkdownImageProps
  extends Omit<HTMLAttributes<HTMLImageElement>, 'onError' | 'onLoad'> {
  src?: string;
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

const MarkdownImage: FC<MarkdownImageProps> = ({ src, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <figure className="my-0 space-y-2">
      <div
        className={`relative w-full overflow-hidden rounded-3xl border border-white/60 bg-slate-100 ${
          isLoaded ? '' : 'animate-pulse'
        } aspect-[4/3]`}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            이미지 준비중...
          </div>
        )}
        <img
          src={src}
          // alt={alt ?? ''}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setIsLoaded(true);
            setIsError(true);
          }}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          {...props}
        />
      </div>
      {isError && (
        <figcaption className="text-center text-xs text-slate-400">
          이미지를 불러오지 못했어요.
        </figcaption>
      )}
    </figure>
  );
};

const markdownComponents: Components = {
  code: CodeBlock as Components['code'],
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-sky-600 mt-8 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-emerald-600 mt-6 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-amber-600 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-700 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-slate-700">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-emerald-200 pl-4 italic text-slate-600 my-4 bg-emerald-50/50 rounded-xl p-4">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-sky-600 hover:text-sky-800 underline decoration-wavy"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: MarkdownImage as Components['img'],
} satisfies Components;

const PostViewerComponent: FC<PostViewerProps> = ({ post }) => {
  const authorLabel = post.author?.trim() || '이름 없는 친구';

  return (
    <article className="markdown-body">
      <header className="mb-4 pb-3 border-b border-emerald-100">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-500">
          FROM {authorLabel}
        </p>
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

export const PostViewer = memo(PostViewerComponent);
