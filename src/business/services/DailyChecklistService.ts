import { hybridStorage } from '../../utils/hybridStorage';
import { DailyChecklistModel } from '../models/DailyChecklistModel';
import { 
  DailyChecklistData, 
  ChecklistTemplate, 
  ProgressInfo, 
  ChecklistSection 
} from '../types/index';

export class DailyChecklistService {
  private storage = hybridStorage;

  async loadAllChecklists(): Promise<Record<string, DailyChecklistModel>> {
    try {
      const allChecklists = await this.storage.getAllDailyChecklists();
      
      const groupedData: Record<string, DailyChecklistModel> = {};
      allChecklists.forEach((checklistData: any) => {
        if (checklistData.date) {
          groupedData[checklistData.date] = new DailyChecklistModel({
            id: checklistData.id,
            date: checklistData.date,
            data: checklistData.data || {}
          });
        }
      });
      
      return groupedData;
    } catch (error) {
      console.error('Failed to load daily checklists:', error);
      return {};
    }
  }

  async saveChecklist(checklist: DailyChecklistModel | DailyChecklistData): Promise<string> {
    try {
      const checklistData = checklist instanceof DailyChecklistModel ? checklist.toJSON() : checklist;
      
      const existingChecklist = await this.storage.getDailyChecklistByDate(checklistData.date);
      
      if (existingChecklist) {
        await this.storage.updateDailyChecklist(existingChecklist.id!, checklistData);
        return existingChecklist.id!;
      } else {
        const savedId = await this.storage.saveDailyChecklist(checklistData);
        return savedId as string;
      }
    } catch (error) {
      console.error('Failed to save daily checklist:', error);
      throw error;
    }
  }

  async updateChecklist(checklistId: string, checklistData: DailyChecklistModel | DailyChecklistData): Promise<boolean> {
    try {
      const updateData = checklistData instanceof DailyChecklistModel ? checklistData.toJSON() : checklistData;
      await this.storage.updateDailyChecklist(checklistId, updateData);
      return true;
    } catch (error) {
      console.error('Failed to update daily checklist:', error);
      throw error;
    }
  }

  async getChecklistByDate(date: string): Promise<DailyChecklistModel | null> {
    try {
      const checklist = await this.storage.getDailyChecklistByDate(date);
      return checklist ? new DailyChecklistModel(checklist) : null;
    } catch (error) {
      console.error('Failed to get checklist by date:', error);
      return null;
    }
  }

  getChecklistTemplate(): ChecklistTemplate {
    return {
      morning: {
        title: '🌅 아침 점검',
        questions: [
          '오늘 하나만큼은 꼭 해내고 싶은 건요?',
          '그게 잘됐다는 건 뭘 보고 알 수 있을까요?',
          '언제, 어떻게 하시겠어요?',
          '혹시 걱정되는 게 있나요?',
          '그걸 위해 뭘 대비/예방하면 좋을까요?'
        ]
      },
      lunch: {
        title: '🏙️ 점심 점검',
        questions: [
          '아침에 계획했던 것은 어떻게 되고 있나요?',
          '내가 바라던 결과와 어떤 차이가 있나요?',
          '지금까지 과정에서 무엇을 배웠나요?',
          '앞으로 어떻게 하시겠어요?',
          '혹시 걱정되는 게 있나요?',
          '그걸 위해 뭘 대비/예방하면 좋을까요?'
        ]
      },
      evening: {
        title: '🌆 저녁 점검',
        questions: [
          '오늘 목표했던 것은 어떻게 되었나요?',
          '내가 바라던 결과와 어떤 차이가 있나요?',
          '어떤 패턴을 발견했나요? 어떻게 도식화 해볼 수 있을까요?',
          '내일까지 이거 하나만큼은 하면 참 좋겠다 하는 건요?',
          '그걸 위해 어떤 준비를 해둘까요?'
        ]
      }
    };
  }

  calculateProgress(checklist: DailyChecklistModel | null): ProgressInfo {
    if (!checklist) return { answered: 0, total: 0, percentage: 0 };
    
    return checklist instanceof DailyChecklistModel 
      ? checklist.getOverallProgress()
      : { answered: 0, total: 0, percentage: 0 };
  }

  getSectionProgress(checklist: DailyChecklistModel | null, section: ChecklistSection): ProgressInfo {
    if (!checklist) return { answered: 0, total: 0, percentage: 0 };
    
    return checklist instanceof DailyChecklistModel 
      ? checklist.getSectionProgress(section)
      : { answered: 0, total: 0, percentage: 0 };
  }
}