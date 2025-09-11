import { useState, useEffect } from 'react';
import { getStorageInfo } from '../utils/storageType';

const StorageIndicator = () => {
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    const info = getStorageInfo();
    setStorageInfo(info);
  }, []);

  if (!storageInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
        storageInfo.isFirebase 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}>
        {storageInfo.isFirebase ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Firebase</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>로컬스토리지</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageIndicator;
