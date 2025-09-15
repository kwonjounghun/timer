export const formatDate = (dateString) => {
  // 안전한 날짜 변환
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return '날짜 오류';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayString = today.toISOString().split('T')[0];
  const yesterdayString = yesterday.toISOString().split('T')[0];

  if (dateString === todayString) {
    return '오늘 (' + date.toLocaleDateString('ko-KR') + ')';
  } else if (dateString === yesterdayString) {
    return '어제 (' + date.toLocaleDateString('ko-KR') + ')';
  } else {
    return date.toLocaleDateString('ko-KR');
  }
};

export const formatTime = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date for formatTime:', date);
    return '시간 오류';
  }
  return dateObj.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export const changeDate = (currentDate, direction) => {
  const date = new Date(currentDate);
  if (isNaN(date.getTime())) {
    console.warn('Invalid currentDate for changeDate:', currentDate);
    return getTodayString(); // 오늘 날짜로 fallback
  }

  if (direction === 'prev') {
    date.setDate(date.getDate() - 1);
  } else {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
};
