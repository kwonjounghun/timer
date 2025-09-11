import ReactMarkdown from 'react-markdown';

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
          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
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
