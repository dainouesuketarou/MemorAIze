export const StudyPurpose = {
  QUALIFICATION: 'QUALIFICATION',
  SCHOOL_EXAM: 'SCHOOL_EXAM',
  QUIZ_TRAINING: 'QUIZ_TRAINING',
  LANGUAGE_LEARNING: 'LANGUAGE_LEARNING',
  OTHER: 'OTHER',
} as const;

export type StudyPurposeType = (typeof StudyPurpose)[keyof typeof StudyPurpose];

export class StudyPurposeValue {
  private readonly _value: StudyPurposeType;

  private constructor(value: StudyPurposeType) {
    this._value = value;
  }

  /**
   * 学習目的を作成する
   */
  public static create(value: StudyPurposeType): StudyPurposeValue {
    if (!Object.values(StudyPurpose).includes(value)) {
      throw new Error('Invalid study purpose.');
    }
    return new StudyPurposeValue(value);
  }

  /**
   * 資格対策を作成する
   */
  public static qualification(): StudyPurposeValue {
    return new StudyPurposeValue(StudyPurpose.QUALIFICATION);
  }

  /**
   * 学校の試験対策を作成する
   */
  public static schoolExam(): StudyPurposeValue {
    return new StudyPurposeValue(StudyPurpose.SCHOOL_EXAM);
  }

  /**
   * クイズトレーニングを作成する
   */
  public static quizTraining(): StudyPurposeValue {
    return new StudyPurposeValue(StudyPurpose.QUIZ_TRAINING);
  }

  /**
   * 語学学習を作成する
   */
  public static languageLearning(): StudyPurposeValue {
    return new StudyPurposeValue(StudyPurpose.LANGUAGE_LEARNING);
  }

  /**
   * その他を作成する
   */
  public static other(): StudyPurposeValue {
    return new StudyPurposeValue(StudyPurpose.OTHER);
  }

  get value(): StudyPurposeType {
    return this._value;
  }

  /**
   * 等価性チェック
   */
  public equals(other: StudyPurposeValue): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列として取得
   */
  public toString(): string {
    return this._value;
  }

  /**
   * 日本語表示名を取得する
   */
  public getDisplayName(): string {
    switch (this._value) {
      case StudyPurpose.QUALIFICATION:
        return '資格対策';
      case StudyPurpose.SCHOOL_EXAM:
        return '学校の試験対策';
      case StudyPurpose.QUIZ_TRAINING:
        return 'クイズトレーニング';
      case StudyPurpose.LANGUAGE_LEARNING:
        return '語学学習';
      case StudyPurpose.OTHER:
        return 'その他';
      default:
        return this._value;
    }
  }
}

/**
 * 学習目的のコレクション
 */
export class StudyPurposeCollection {
  private readonly _purposes: StudyPurposeValue[];

  private constructor(purposes: StudyPurposeValue[]) {
    this._purposes = purposes;
  }

  /**
   * 空のコレクションを作成する
   */
  public static empty(): StudyPurposeCollection {
    return new StudyPurposeCollection([]);
  }

  /**
   * 学習目的の配列からコレクションを作成する
   */
  public static fromArray(
    purposes: StudyPurposeType[],
  ): StudyPurposeCollection {
    const studyPurposes = purposes.map((purpose) =>
      StudyPurposeValue.create(purpose),
    );
    return new StudyPurposeCollection(studyPurposes);
  }

  /**
   * 単一の学習目的からコレクションを作成する
   */
  public static fromSingle(purpose: StudyPurposeType): StudyPurposeCollection {
    return new StudyPurposeCollection([StudyPurposeValue.create(purpose)]);
  }

  /**
   * 永続化層からのデータでコレクションを復元
   */
  public static fromPersistence(
    purposes: StudyPurposeType[],
  ): StudyPurposeCollection {
    return this.fromArray(purposes);
  }

  get purposes(): StudyPurposeValue[] {
    return [...this._purposes];
  }

  get values(): StudyPurposeType[] {
    return this._purposes.map((purpose) => purpose.value);
  }

  /**
   * 指定された学習目的が含まれているかチェックする
   */
  public has(purpose: StudyPurposeType): boolean {
    return this._purposes.some((p) => p.value === purpose);
  }

  /**
   * 学習目的を追加する
   */
  public add(purpose: StudyPurposeType): StudyPurposeCollection {
    if (!this.has(purpose)) {
      const newPurposes = [
        ...this._purposes,
        StudyPurposeValue.create(purpose),
      ];
      return new StudyPurposeCollection(newPurposes);
    }
    return this;
  }

  /**
   * 学習目的を削除する
   */
  public remove(purpose: StudyPurposeType): StudyPurposeCollection {
    const newPurposes = this._purposes.filter((p) => p.value !== purpose);
    return new StudyPurposeCollection(newPurposes);
  }

  /**
   * コレクションが空かどうか
   */
  public isEmpty(): boolean {
    return this._purposes.length === 0;
  }

  /**
   * コレクションのサイズ
   */
  public size(): number {
    return this._purposes.length;
  }

  /**
   * 等価性チェック
   */
  public equals(other: StudyPurposeCollection): boolean {
    if (this._purposes.length !== other._purposes.length) {
      return false;
    }
    return this._purposes.every((purpose, index) =>
      purpose.equals(other._purposes[index]),
    );
  }
}
