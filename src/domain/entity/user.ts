import {
  StudyPurposeValue,
  StudyPurposeType,
  StudyPurposeCollection,
} from '../value-object/study-purpose';

export type UserId = string;
export type UserEmail = string;

export interface UserProps {
  id: UserId;
  email: UserEmail;
  name: string | null;
  image: string | null;
  isOnboarded: boolean;
  studyPurposes: StudyPurposeCollection;
}

export class User {
  private readonly _id: UserId;
  private _email: UserEmail;
  private _name: string | null;
  private _image: string | null;
  private _isOnboarded: boolean;
  private _studyPurposes: StudyPurposeCollection;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._name = props.name;
    this._image = props.image;
    this._isOnboarded = props.isOnboarded;
    this._studyPurposes = props.studyPurposes;
  }

  /**
   * 新規ユーザー作成時（OAuthやEmail経由）
   */
  public static create(
    props: { email: UserEmail; name?: string | null; image?: string | null },
    id: UserId,
  ): User {
    return new User({
      id,
      email: props.email,
      name: props.name ?? null,
      image: props.image ?? null,
      isOnboarded: false,
      studyPurposes: StudyPurposeCollection.empty(),
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
    return this._id;
  }
  get email(): UserEmail {
    return this._email;
  }
  get name(): string | null {
    return this._name;
  }
  get image(): string | null {
    return this._image;
  }
  get isOnboarded(): boolean {
    return this._isOnboarded;
  }
  get studyPurposes(): StudyPurposeCollection {
    return this._studyPurposes;
  }

  /**
   * オンボーディングを完了させる
   */
  public completeOnboarding(name: string, purposes: StudyPurposeType[]) {
    if (!name) {
      throw new Error('Username cannot be empty for onboarding.');
    }
    this._name = name;
    this._studyPurposes = StudyPurposeCollection.fromArray(purposes);
    this._isOnboarded = true;
  }

  /**
   * プロフィール情報を更新する
   */
  public updateProfile(data: { name?: string; image?: string }) {
    if (typeof data.name === 'string') {
      this._name = data.name;
    }
    if (typeof data.image === 'string') {
      this._image = data.image;
    }
  }
}
