export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateString === today.toISOString().split('T')[0]) {
    return '오늘 (' + date.toLocaleDateString('ko-KR') + ')';
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return '어제 (' + date.toLocaleDateString('ko-KR') + ')';
  } else {
    return date.toLocaleDateString('ko-KR');
  }
};

export const formatTime = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
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
  if (direction === 'prev') {
    date.setDate(date.getDate() - 1);
  } else {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
};
