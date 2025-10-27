export const copySectionContent = async (sectionKey, sectionData, checklistTemplate) => {
  const sectionTitle = checklistTemplate[sectionKey].title;
  let content = `# ${sectionTitle}\n\n`;
  
  if (!sectionData) {
    content += '아직 작성된 내용이 없습니다.\n\n';
  } else {
    checklistTemplate[sectionKey].questions.forEach((question, index) => {
      const answer = sectionData[index] || '';
      content += `## ${question}\n${answer || '답변이 없습니다.'}\n\n`;
    });
  }

  try {
    await navigator.clipboard.writeText(content);
    alert(`${sectionTitle} 내용이 클립보드에 복사되었습니다.`);
  } catch (err) {
    console.error('복사 실패:', err);
    alert('복사에 실패했습니다.');
  }
};
