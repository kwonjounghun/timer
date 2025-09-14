import React, { useState } from 'react';
import { HelpCircle, X, Code, Bold, Italic, List, Hash } from 'lucide-react';

interface MarkdownHelpProps {
  className?: string;
}

export const MarkdownHelp: React.FC<MarkdownHelpProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const examples = [
    {
      icon: <Bold size={16} />,
      name: '굵게',
      syntax: '**텍스트**',
      result: '**텍스트**'
    },
    {
      icon: <Italic size={16} />,
      name: '기울임',
      syntax: '*텍스트*',
      result: '*텍스트*'
    },
    {
      icon: <List size={16} />,
      name: '목록',
      syntax: '- 항목',
      result: '- 항목'
    },
    {
      icon: <Hash size={16} />,
      name: '제목',
      syntax: '# 제목',
      result: '# 제목'
    },
    {
      icon: <Code size={16} />,
      name: '인라인 코드',
      syntax: '`코드`',
      result: '`코드`'
    },
    {
      icon: <Code size={16} />,
      name: '코드블럭',
      syntax: '```javascript\n코드\n```',
      result: '```javascript\n코드\n```'
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${className}`}
        title="마크다운 문법 도움말"
      >
        <HelpCircle size={12} />
        마크다운 도움말
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">마크다운 문법 도움말</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {example.icon}
                      <span className="font-semibold text-gray-800">{example.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">문법:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {example.syntax}
                        </code>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">결과:</span>
                        <div className="ml-2 mt-1 p-2 bg-gray-50 rounded text-sm">
                          <MarkdownRenderer content={example.result} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">💡 팁</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 코드블럭에는 언어를 지정할 수 있습니다: ```javascript, ```python, ```css 등</li>
                  <li>• 미리보기 버튼을 사용하여 작성 중인 내용을 실시간으로 확인하세요</li>
                  <li>• 마크다운 문법은 대소문자를 구분합니다</li>
                  <li>• <strong>포맷팅 버튼</strong>을 클릭하면 코드블럭이 자동으로 정리됩니다</li>
                  <li>• 텍스트 영역에서 포커스를 잃으면 자동으로 포맷팅이 적용됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
