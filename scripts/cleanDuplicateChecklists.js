import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query
} from 'firebase/firestore';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION_NAME = 'daily_checklists';

/**
 * 모든 일일 체크리스트 데이터를 조회
 */
async function getAllChecklists() {
  console.log('📋 일일 체크리스트 데이터를 조회합니다...');

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const checklists = [];
    querySnapshot.forEach((doc) => {
      checklists.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ 총 ${checklists.length}개의 체크리스트 데이터를 찾았습니다.`);
    return checklists;
  } catch (error) {
    console.error('❌ 데이터 조회 실패:', error);
    throw error;
  }
}

/**
 * 날짜별로 데이터를 그룹핑하고 중복을 찾음
 */
function findDuplicates(checklists) {
  console.log('🔍 중복 데이터를 찾는 중...');

  const dateGroups = {};
  const duplicates = [];

  // 날짜별로 그룹핑
  checklists.forEach(checklist => {
    const date = checklist.date;
    if (!date) {
      console.warn('⚠️  날짜가 없는 데이터 발견:', checklist.id);
      return;
    }

    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(checklist);
  });

  // 중복 날짜 찾기
  Object.entries(dateGroups).forEach(([date, items]) => {
    if (items.length > 1) {
      console.log(`📅 ${date}: ${items.length}개의 중복 데이터 발견`);

      // createdAt 또는 updatedAt 기준으로 정렬 (최신순)
      const sorted = items.sort((a, b) => {
        const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
        const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
        return bTime - aTime; // 내림차순 (최신이 앞으로)
      });

      // 가장 최신 것을 제외한 나머지는 삭제 대상
      const toDelete = sorted.slice(1);
      const toKeep = sorted[0];

      console.log(`  📌 유지할 데이터: ${toKeep.id} (${new Date((toKeep.updatedAt?.seconds || toKeep.createdAt?.seconds || 0) * 1000).toISOString()})`);

      toDelete.forEach(item => {
        console.log(`  🗑️  삭제할 데이터: ${item.id} (${new Date((item.updatedAt?.seconds || item.createdAt?.seconds || 0) * 1000).toISOString()})`);
        duplicates.push(item);
      });
    }
  });

  console.log(`🎯 총 ${duplicates.length}개의 중복 데이터를 삭제해야 합니다.`);
  return duplicates;
}

/**
 * 중복 데이터 삭제
 */
async function deleteDuplicates(duplicates, dryRun = true) {
  if (duplicates.length === 0) {
    console.log('✅ 삭제할 중복 데이터가 없습니다.');
    return;
  }

  if (dryRun) {
    console.log('\n🔍 DRY RUN 모드: 실제로 삭제하지 않고 시뮬레이션만 진행합니다.');
    console.log(`📊 삭제될 데이터 목록:`);
    duplicates.forEach((item, index) => {
      console.log(`  ${index + 1}. ID: ${item.id}, Date: ${item.date}`);
    });
    console.log('\n💡 실제 삭제를 원하시면 스크립트를 dryRun=false로 실행하세요.');
    return;
  }

  console.log(`\n🗑️  ${duplicates.length}개의 중복 데이터를 삭제합니다...`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of duplicates) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, item.id));
      console.log(`✅ 삭제 완료: ${item.id} (${item.date})`);
      successCount++;
    } catch (error) {
      console.error(`❌ 삭제 실패: ${item.id} (${item.date})`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 삭제 결과:`);
  console.log(`  ✅ 성공: ${successCount}개`);
  console.log(`  ❌ 실패: ${errorCount}개`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 일일 체크리스트 중복 제거 스크립트를 시작합니다...\n');

  try {
    // 1. 모든 데이터 조회
    const checklists = await getAllChecklists();

    if (checklists.length === 0) {
      console.log('📭 조회된 데이터가 없습니다.');
      return;
    }

    // 2. 중복 데이터 찾기
    const duplicates = findDuplicates(checklists);

    if (duplicates.length === 0) {
      console.log('🎉 중복 데이터가 없습니다. 정리가 완료되어 있습니다!');
      return;
    }

    // 3. 중복 데이터 삭제 (기본은 DRY RUN)
    const dryRun = process.argv.includes('--execute') ? false : true;
    await deleteDuplicates(duplicates, dryRun);

    if (dryRun) {
      console.log('\n💡 실제 삭제를 실행하려면 다음 명령어를 사용하세요:');
      console.log('node scripts/cleanDuplicateChecklists.js --execute');
    }

  } catch (error) {
    console.error('💥 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  }

  console.log('\n🏁 스크립트 실행이 완료되었습니다.');
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, getAllChecklists, findDuplicates, deleteDuplicates };