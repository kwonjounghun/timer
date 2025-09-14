import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const MarkdownRenderer = ({ content, className = "" }) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-800">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language) {
              return (
                <div className="my-4">
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={language}
                    PreTag="div"
                    className="rounded-lg"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{children}</blockquote>,
          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mb-1">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
