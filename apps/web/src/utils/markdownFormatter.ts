// 간단한 코드 포맷팅 함수들
const formatJavaScript = (code: string): string => {
  try {
    // 기본적인 JavaScript 포맷팅
    let formatted = code
      // 객체와 함수의 중괄호 앞에 줄바꿈 추가
      .replace(/(\w+)\s*{\s*/g, '$1 {\n  ')
      .replace(/{\s*/g, '{\n  ')
      // 세미콜론 뒤에 줄바꿈 추가
      .replace(/;\s*/g, ';\n')
      // 쉼표 뒤에 줄바꿈과 들여쓰기 추가
      .replace(/,\s*/g, ',\n  ')
      // 닫는 중괄호 앞에 줄바꿈 추가
      .replace(/\s*}\s*/g, '\n}')
      // 연속된 줄바꿈 제거
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // 들여쓰기 정리
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';

      // 닫는 중괄호가 있으면 들여쓰기 레벨 감소
      if (trimmed.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indented = '  '.repeat(indentLevel) + trimmed;

      // 여는 중괄호가 있으면 들여쓰기 레벨 증가
      if (trimmed.includes('{')) {
        indentLevel++;
      }

      return indented;
    });

    return indentedLines.join('\n');
  } catch (error) {
    console.warn('JavaScript formatting error:', error);
    return code;
  }
};

const formatJSON = (code: string): string => {
  try {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    return code;
  }
};

const formatCSS = (code: string): string => {
  try {
    return code
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  } catch (error) {
    return code;
  }
};

const formatHTML = (code: string): string => {
  try {
    return code
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          return '  ' + trimmed;
        }
        return trimmed;
      })
      .join('\n');
  } catch (error) {
    return code;
  }
};

// 지원하는 언어별 포맷팅 함수 매핑
const languageFormatterMap: Record<string, (code: string) => string> = {
  javascript: formatJavaScript,
  js: formatJavaScript,
  typescript: formatJavaScript,
  ts: formatJavaScript,
  json: formatJSON,
  css: formatCSS,
  html: formatHTML,
  xml: formatHTML,
};

// 코드블럭을 찾고 포맷팅하는 함수
export const formatMarkdownCodeBlocks = (content: string): string => {
  // 코드블럭 패턴: ```언어\n코드\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  return content.replace(codeBlockRegex, (match, language, code) => {
    if (!language) {
      // 언어가 지정되지 않은 경우 그대로 반환
      return match;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      // 빈 코드블럭인 경우 그대로 반환
      return match;
    }

    try {
      const formatter = languageFormatterMap[language.toLowerCase()];
      if (!formatter) {
        // 지원하지 않는 언어인 경우 그대로 반환
        console.log(`Language ${language} not supported for formatting`);
        return match;
      }

      // 포맷팅 함수로 포맷팅
      const formattedCode = formatter(trimmedCode);

      // 포맷팅된 코드로 교체
      return `\`\`\`${language}\n${formattedCode}\n\`\`\``;
    } catch (error) {
      // 포맷팅 실패 시 원본 반환
      console.warn(`Failed to format ${language} code block:`, error);
      return match;
    }
  });
};

// 전체 마크다운 텍스트를 포맷팅하는 함수
export const formatMarkdown = (content: string): string => {
  try {
    // 1. 코드블럭 포맷팅
    let formatted = formatMarkdownCodeBlocks(content);

    // 2. 전체 마크다운 포맷팅 (선택사항)
    // prettier.format(formatted, { parser: 'markdown' });

    return formatted;
  } catch (error) {
    console.warn('Failed to format markdown:', error);
    return content;
  }
};

// 코드블럭이 있는지 확인하는 함수
export const hasCodeBlocks = (content: string): boolean => {
  return /```\w*\n[\s\S]*?```/.test(content);
};

// 지원하는 언어 목록을 반환하는 함수
export const getSupportedLanguages = (): string[] => {
  return Object.keys(languageFormatterMap);
};

// 디버깅을 위한 테스트 함수
export const testFormatting = (): void => {
  const testContent = `**테스트 코드:**

\`\`\`javascript
const example={name:"John",age:30,skills:["JavaScript","React"]};
function greet(user){return \`Hello, \${user.name}!\`;}
\`\`\`

*포맷팅 후:*
\`\`\`json
{"name":"John","age":30,"skills":["JavaScript","React"]}
\`\`\``;

  console.log('Original:', testContent);
  const formatted = formatMarkdown(testContent);
  console.log('Formatted:', formatted);
};
