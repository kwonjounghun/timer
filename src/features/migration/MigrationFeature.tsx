import React, { useState, useEffect } from 'react';
import {
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Info
} from 'lucide-react';
import {
  checkSchemaVersion,
  runFullMigration,
  migrateFocusCycles,
  migrateDailyChecklists,
  cleanupOldData,
  getMigrationLogs,
  MigrationResult
} from '../../utils/dataMigration';

interface MigrationStatus {
  focusCycles: {
    currentVersion: string;
    needsMigration: boolean;
    documents: any[];
  };
  dailyChecklists: {
    currentVersion: string;
    needsMigration: boolean;
    documents: any[];
  };
}

export const MigrationFeature: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    results: any;
    summary: any;
  } | null>(null);
  const [migrationLogs, setMigrationLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'migrate' | 'logs' | 'cleanup'>('status');

  // 초기 상태 확인
  useEffect(() => {
    checkMigrationStatus();
    loadMigrationLogs();
  }, []);

  const checkMigrationStatus = async () => {
    setIsLoading(true);
    try {
      const [focusCyclesStatus, dailyChecklistsStatus] = await Promise.all([
        checkSchemaVersion('focus_cycles'),
        checkSchemaVersion('daily_checklists')
      ]);

      setMigrationStatus({
        focusCycles: focusCyclesStatus,
        dailyChecklists: dailyChecklistsStatus
      });
    } catch (error) {
      console.error('마이그레이션 상태 확인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMigrationLogs = async () => {
    try {
      const logs = await getMigrationLogs();
      setMigrationLogs(logs);
    } catch (error) {
      console.error('마이그레이션 로그 로드 실패:', error);
    }
  };

  const handleFullMigration = async () => {
    if (!window.confirm('전체 데이터 마이그레이션을 실행하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await runFullMigration();
      setMigrationResult(result);
      await checkMigrationStatus();
      await loadMigrationLogs();
    } catch (error) {
      console.error('마이그레이션 실행 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusCyclesMigration = async () => {
    setIsLoading(true);
    try {
      const result = await migrateFocusCycles();
      setMigrationResult({
        success: result.success,
        results: { focusCycles: result },
        summary: {
          totalDocuments: result.details.totalDocuments,
          totalMigrated: result.details.migratedDocuments,
          totalFailed: result.details.failedDocuments,
          hasErrors: result.details.errors.length > 0
        }
      });
      await checkMigrationStatus();
      await loadMigrationLogs();
    } catch (error) {
      console.error('포커스 사이클 마이그레이션 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDailyChecklistsMigration = async () => {
    setIsLoading(true);
    try {
      const result = await migrateDailyChecklists();
      setMigrationResult({
        success: result.success,
        results: { dailyChecklists: result },
        summary: {
          totalDocuments: result.details.totalDocuments,
          totalMigrated: result.details.migratedDocuments,
          totalFailed: result.details.failedDocuments,
          hasErrors: result.details.errors.length > 0
        }
      });
      await checkMigrationStatus();
      await loadMigrationLogs();
    } catch (error) {
      console.error('일일 체크리스트 마이그레이션 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('30일 이전의 오래된 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await cleanupOldData();
      setMigrationResult({
        success: result.success,
        results: { cleanup: result },
        summary: {
          totalDocuments: result.details.totalDocuments,
          totalMigrated: result.details.migratedDocuments,
          totalFailed: result.details.failedDocuments,
          hasErrors: result.details.errors.length > 0
        }
      });
      await checkMigrationStatus();
      await loadMigrationLogs();
    } catch (error) {
      console.error('데이터 정리 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (needsMigration: boolean) => {
    return needsMigration ? (
      <AlertTriangle className="text-yellow-500" size={20} />
    ) : (
      <CheckCircle className="text-green-500" size={20} />
    );
  };

  const getStatusText = (needsMigration: boolean) => {
    return needsMigration ? '마이그레이션 필요' : '최신 상태';
  };

  const getStatusColor = (needsMigration: boolean) => {
    return needsMigration ? 'text-yellow-600' : 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1"></div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Database className="text-blue-500" size={32} />
              데이터 마이그레이션
            </h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={checkMigrationStatus}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                상태 새로고침
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-center">파이어베이스 데이터 구조 업데이트 및 관리</p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'status', label: '상태 확인', icon: Info },
              { id: 'migrate', label: '마이그레이션', icon: Upload },
              { id: 'logs', label: '마이그레이션 로그', icon: Download },
              { id: 'cleanup', label: '데이터 정리', icon: Trash2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 상태 확인 탭 */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">데이터베이스 상태</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="animate-spin text-blue-500" size={24} />
                  <span className="ml-2 text-gray-600">상태 확인 중...</span>
                </div>
              ) : migrationStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 포커스 사이클 상태 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">포커스 사이클</h3>
                      {getStatusIcon(migrationStatus.focusCycles.needsMigration)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">스키마 버전:</span>
                        <span className="font-mono text-sm">{migrationStatus.focusCycles.currentVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">문서 수:</span>
                        <span>{migrationStatus.focusCycles.documents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태:</span>
                        <span className={getStatusColor(migrationStatus.focusCycles.needsMigration)}>
                          {getStatusText(migrationStatus.focusCycles.needsMigration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 일일 체크리스트 상태 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">일일 체크리스트</h3>
                      {getStatusIcon(migrationStatus.dailyChecklists.needsMigration)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">스키마 버전:</span>
                        <span className="font-mono text-sm">{migrationStatus.dailyChecklists.currentVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">문서 수:</span>
                        <span>{migrationStatus.dailyChecklists.documents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태:</span>
                        <span className={getStatusColor(migrationStatus.dailyChecklists.needsMigration)}>
                          {getStatusText(migrationStatus.dailyChecklists.needsMigration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  상태를 확인할 수 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 마이그레이션 탭 */}
        {activeTab === 'migrate' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">데이터 마이그레이션</h2>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-yellow-800">주의사항</h3>
                      <p className="text-yellow-700 text-sm mt-1">
                        마이그레이션은 데이터 구조를 업데이트합니다. 이 작업은 되돌릴 수 없으므로 신중하게 진행해주세요.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleFocusCyclesMigration}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    포커스 사이클 마이그레이션
                  </button>

                  <button
                    onClick={handleDailyChecklistsMigration}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    체크리스트 마이그레이션
                  </button>

                  <button
                    onClick={handleFullMigration}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    전체 마이그레이션
                  </button>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="animate-spin text-blue-500" size={20} />
                    <span className="ml-2 text-gray-600">마이그레이션 실행 중...</span>
                  </div>
                )}

                {migrationResult && (
                  <div className={`border rounded-lg p-4 ${migrationResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-start gap-3">
                      {migrationResult.success ? (
                        <CheckCircle className="text-green-600 mt-0.5" size={20} />
                      ) : (
                        <XCircle className="text-red-600 mt-0.5" size={20} />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${migrationResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                          마이그레이션 결과
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>총 문서 수:</span>
                            <span>{migrationResult.summary.totalDocuments}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>마이그레이션된 문서:</span>
                            <span className="text-green-600">{migrationResult.summary.totalMigrated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>실패한 문서:</span>
                            <span className="text-red-600">{migrationResult.summary.totalFailed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 마이그레이션 로그 탭 */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">마이그레이션 로그</h2>

              {migrationLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  마이그레이션 로그가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {migrationLogs.map((log, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{log.description}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>버전: {log.version}</div>
                        <div>실행 시간: {log.executedAt?.toDate?.()?.toLocaleString() || 'N/A'}</div>
                        <div>영향받은 문서: {log.affectedDocuments}개</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 데이터 정리 탭 */}
        {activeTab === 'cleanup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">데이터 정리</h2>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-red-800">위험한 작업</h3>
                      <p className="text-red-700 text-sm mt-1">
                        30일 이전의 오래된 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCleanup}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  오래된 데이터 삭제
                </button>

                {migrationResult && migrationResult.results.cleanup && (
                  <div className={`border rounded-lg p-4 ${migrationResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-start gap-3">
                      {migrationResult.success ? (
                        <CheckCircle className="text-green-600 mt-0.5" size={20} />
                      ) : (
                        <XCircle className="text-red-600 mt-0.5" size={20} />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${migrationResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                          정리 결과
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>삭제된 문서:</span>
                            <span className="text-green-600">{migrationResult.summary.totalMigrated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>실패한 문서:</span>
                            <span className="text-red-600">{migrationResult.summary.totalFailed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
