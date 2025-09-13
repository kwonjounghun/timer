import { DailyChecklistData, ProgressInfo, ChecklistSection } from '../types/index';

export class DailyChecklistModel {
  public readonly id: string;
  public readonly date: string;
  public data: Record<string, Record<number, string>>;

  constructor({
    id,
    date,
    data = {}
  }: DailyChecklistData) {
    this.id = id || this.generateId();
    this.date = date;
    this.data = data;
  }

  private generateId(): string {
    return `checklist_${this.date}_${Date.now()}`;
  }

  updateAnswer(section: string, questionIndex: number, answer: string): this {
    if (!this.data[section]) {
      this.data[section] = {};
    }
    this.data[section][questionIndex] = answer;
    return this;
  }

  getAnswer(section: string, questionIndex: number): string {
    return this.data[section]?.[questionIndex] || '';
  }

  getSectionData(section: string): Record<number, string> {
    return this.data[section] || {};
  }

  hasAnswers(): boolean {
    return Object.keys(this.data).some(section =>
      this.data[section] &&
      Object.values(this.data[section]).some(answer => answer && answer.trim())
    );
  }

  getSectionProgress(section: ChecklistSection): ProgressInfo {
    const sectionData = this.data[section] || {};
    const totalQuestions = this.getTotalQuestionsForSection(section);
    const answeredQuestions = Object.values(sectionData).filter(answer => answer && answer.trim()).length;
    
    return {
      answered: answeredQuestions,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
    };
  }

  private getTotalQuestionsForSection(section: ChecklistSection): number {
    const questionCounts: Record<ChecklistSection, number> = {
      morning: 5,
      lunch: 6,
      evening: 5
    };
    return questionCounts[section] || 0;
  }

  getOverallProgress(): ProgressInfo {
    const sections: ChecklistSection[] = ['morning', 'lunch', 'evening'];
    let totalAnswered = 0;
    let totalQuestions = 0;

    sections.forEach(section => {
      const progress = this.getSectionProgress(section);
      totalAnswered += progress.answered;
      totalQuestions += progress.total;
    });

    return {
      answered: totalAnswered,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0
    };
  }

  toJSON(): DailyChecklistData {
    return {
      id: this.id,
      date: this.date,
      data: this.data
    };
  }

  static fromJSON(json: DailyChecklistData): DailyChecklistModel {
    return new DailyChecklistModel(json);
  }
}