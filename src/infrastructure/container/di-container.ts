// 依存性注入コンテナ
import { IDeckRepository } from '../../domain/repository/deck';
import { IUserRepository } from '../../domain/repository/user';
import { ICardRepository } from '../../domain/repository/card';
import { IGroupRepository } from '../../domain/repository/group';
import { ISubscriptionRepository } from '../../domain/repository/subscription';
import { IStudyHistoryRepository } from '../../domain/repository/study-history';
import { IDeckSettingRepository } from '../../domain/repository/deck-setting';
import { IAiGenerationLimitRepository } from '../../domain/repository/ai-generation-limit';
import { ILoginHistoryRepository } from '../../domain/repository/login-history';

// リポジトリ実装
import { DeckPrismaRepository } from '../persistence/deck/deck.prisma.repository';
import { UserPrismaRepository } from '../persistence/user/user.prisma.repository';
import { CardPrismaRepository } from '../persistence/card/card.prisma.repository';
import { GroupPrismaRepository } from '../persistence/group/group.prisma.repository';
import { SubscriptionPrismaRepository } from '../persistence/subscription/subscription.prisma.repository';
import { StudyHistoryPrismaRepository } from '../persistence/study-history/study-history.prisma.repository';
import { DeckSettingPrismaRepository } from '../persistence/deck-setting/deck-setting.prisma.repository';
import { AiGenerationLimitPrismaRepository } from '../persistence/ai-generation-limit/ai-generation-limit.prisma.repository';
import { LoginHistoryPrismaRepository } from '../persistence/login-history/login-history.prisma.repository';

// ユースケース
import { CreateDeckUseCase } from '../../application/deck/create-deck.use-case';
import { UpdateDeckUseCase } from '../../application/deck/update-deck.use-case';
import { GetDeckUseCase } from '../../application/deck/get-deck.use-case';
import { DeleteDeckUseCase } from '../../application/deck/delete-deck.use-case';
import { UpdateDeckGroupsUseCase } from '../../application/deck/update-deck-groups.use-case';
import { AddCardUseCase } from '../../application/card/add-card.use-case';
import { UpdateCardUseCase } from '../../application/card/update-card.use-case';
import { DeleteCardUseCase } from '../../application/card/delete-card.use-case';
import { SaveCardsUseCase } from '../../application/card/save-cards.use-case';
import { StudyDeckUseCase } from '../../application/deck/study-deck.use-case';
import { CompleteOnboardingUseCase } from '../../application/user/complete-onboarding.use-case';
import { GetUserProfileUseCase } from '../../application/user/get-user-profile.use-case';
import { GetOnboardingStatusUseCase } from '../../application/user/get-onboarding-status.use-case';
import { CreateGroupUseCase } from '../../application/group/create-group.use-case';
import { GetUserGroupsUseCase } from '../../application/group/get-user-groups.use-case';
import { UpdateGroupUseCase } from '../../application/group/update-group.use-case';
import { DeleteGroupUseCase } from '../../application/group/delete-group.use-case';
import { GetUserSubscriptionUseCase } from '../../application/subscription/get-user-subscription.use-case';
import { ActivateSubscriptionUseCase } from '../../application/subscription/activate-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/subscription/cancel-subscription.use-case';
import { CreateStudyHistoryUseCase } from '../../application/study-history/create-study-history.use-case';
import { GetDeckStudyHistoryUseCase } from '../../application/study-history/get-deck-study-history.use-case';
import { UpdateStudyResultUseCase } from '../../application/study/update-study-result.use-case';
import { CreateLoginHistoryUseCase } from '../../application/login-history/create-login-history.use-case';
import { GetUserLoginHistoryUseCase } from '../../application/login-history/get-user-login-history.use-case';
import { GetDeckSettingUseCase } from '../../application/deck-setting/get-deck-setting.use-case';
import { UpdateDeckSettingUseCase } from '../../application/deck-setting/update-deck-setting.use-case';
import { GetUserAiLimitUseCase } from '../../application/ai-generation-limit/get-user-ai-limit.use-case';
import { IncrementAiLimitUseCase } from '../../application/ai-generation-limit/increment-ai-limit.use-case';

class DIContainer {
  private static instance: DIContainer;

  // リポジトリ
  private deckRepository: IDeckRepository;
  private userRepository: IUserRepository;
  private cardRepository: ICardRepository;
  private groupRepository: IGroupRepository;
  private subscriptionRepository: ISubscriptionRepository;
  private studyHistoryRepository: IStudyHistoryRepository;
  private deckSettingRepository: IDeckSettingRepository;
  private aiGenerationLimitRepository: IAiGenerationLimitRepository;
  private loginHistoryRepository: ILoginHistoryRepository;

  // ユースケース
  private createDeckUseCase: CreateDeckUseCase;
  private updateDeckUseCase: UpdateDeckUseCase;
  private getDeckUseCase: GetDeckUseCase;
  private deleteDeckUseCase: DeleteDeckUseCase;
  private updateDeckGroupsUseCase: UpdateDeckGroupsUseCase;
  private addCardUseCase: AddCardUseCase;
  private updateCardUseCase: UpdateCardUseCase;
  private deleteCardUseCase: DeleteCardUseCase;
  private saveCardsUseCase: SaveCardsUseCase;
  private studyDeckUseCase: StudyDeckUseCase;
  private completeOnboardingUseCase: CompleteOnboardingUseCase;
  private getUserProfileUseCase: GetUserProfileUseCase;
  private getOnboardingStatusUseCase: GetOnboardingStatusUseCase;
  private createGroupUseCase: CreateGroupUseCase;
  private getUserGroupsUseCase: GetUserGroupsUseCase;
  private updateGroupUseCase: UpdateGroupUseCase;
  private deleteGroupUseCase: DeleteGroupUseCase;
  private getUserSubscriptionUseCase: GetUserSubscriptionUseCase;
  private activateSubscriptionUseCase: ActivateSubscriptionUseCase;
  private cancelSubscriptionUseCase: CancelSubscriptionUseCase;
  private createStudyHistoryUseCase: CreateStudyHistoryUseCase;
  private getDeckStudyHistoryUseCase: GetDeckStudyHistoryUseCase;
  private updateStudyResultUseCase: UpdateStudyResultUseCase;
  private createLoginHistoryUseCase: CreateLoginHistoryUseCase;
  private getUserLoginHistoryUseCase: GetUserLoginHistoryUseCase;
  private getDeckSettingUseCase: GetDeckSettingUseCase;
  private updateDeckSettingUseCase: UpdateDeckSettingUseCase;
  private getUserAiLimitUseCase: GetUserAiLimitUseCase;
  private incrementAiLimitUseCase: IncrementAiLimitUseCase;

  private constructor() {
    // リポジトリの初期化
    this.deckRepository = new DeckPrismaRepository();
    this.userRepository = new UserPrismaRepository();
    this.cardRepository = new CardPrismaRepository();
    this.groupRepository = new GroupPrismaRepository();
    this.subscriptionRepository = new SubscriptionPrismaRepository();
    this.studyHistoryRepository = new StudyHistoryPrismaRepository();
    this.deckSettingRepository = new DeckSettingPrismaRepository();
    this.aiGenerationLimitRepository = new AiGenerationLimitPrismaRepository();
    this.loginHistoryRepository = new LoginHistoryPrismaRepository();

    // ユースケースの初期化
    this.createDeckUseCase = new CreateDeckUseCase(this.deckRepository);
    this.updateDeckUseCase = new UpdateDeckUseCase(this.deckRepository);
    this.getDeckUseCase = new GetDeckUseCase(this.deckRepository);
    this.deleteDeckUseCase = new DeleteDeckUseCase(
      this.deckRepository,
      this.cardRepository,
      this.studyHistoryRepository,
      this.deckSettingRepository,
    );
    this.updateDeckGroupsUseCase = new UpdateDeckGroupsUseCase(
      this.deckRepository,
    );
    this.addCardUseCase = new AddCardUseCase(this.deckRepository);
    this.updateCardUseCase = new UpdateCardUseCase(this.cardRepository);
    this.deleteCardUseCase = new DeleteCardUseCase(
      this.deckRepository,
      this.cardRepository,
    );
    this.saveCardsUseCase = new SaveCardsUseCase(
      this.deckRepository,
      this.cardRepository,
    );
    this.studyDeckUseCase = new StudyDeckUseCase(this.deckRepository);
    this.completeOnboardingUseCase = new CompleteOnboardingUseCase(
      this.userRepository,
    );
    this.getUserProfileUseCase = new GetUserProfileUseCase(this.userRepository);
    this.getOnboardingStatusUseCase = new GetOnboardingStatusUseCase(
      this.userRepository,
    );
    this.createGroupUseCase = new CreateGroupUseCase(this.groupRepository);
    this.getUserGroupsUseCase = new GetUserGroupsUseCase(this.groupRepository);
    this.updateGroupUseCase = new UpdateGroupUseCase(this.groupRepository);
    this.deleteGroupUseCase = new DeleteGroupUseCase(this.groupRepository);
    this.getUserSubscriptionUseCase = new GetUserSubscriptionUseCase(
      this.subscriptionRepository,
    );
    this.activateSubscriptionUseCase = new ActivateSubscriptionUseCase(
      this.subscriptionRepository,
    );
    this.cancelSubscriptionUseCase = new CancelSubscriptionUseCase(
      this.subscriptionRepository,
    );
    this.createStudyHistoryUseCase = new CreateStudyHistoryUseCase(
      this.studyHistoryRepository,
    );
    this.getDeckStudyHistoryUseCase = new GetDeckStudyHistoryUseCase(
      this.studyHistoryRepository,
    );
    this.updateStudyResultUseCase = new UpdateStudyResultUseCase(
      this.deckRepository,
      this.cardRepository,
    );
    this.createLoginHistoryUseCase = new CreateLoginHistoryUseCase(
      this.loginHistoryRepository,
    );
    this.getUserLoginHistoryUseCase = new GetUserLoginHistoryUseCase(
      this.loginHistoryRepository,
    );
    this.getDeckSettingUseCase = new GetDeckSettingUseCase(
      this.deckSettingRepository,
    );
    this.updateDeckSettingUseCase = new UpdateDeckSettingUseCase(
      this.deckSettingRepository,
    );
    this.getUserAiLimitUseCase = new GetUserAiLimitUseCase(
      this.aiGenerationLimitRepository,
    );
    this.incrementAiLimitUseCase = new IncrementAiLimitUseCase(
      this.aiGenerationLimitRepository,
    );
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // リポジトリの取得
  public getDeckRepository(): IDeckRepository {
    return this.deckRepository;
  }

  public getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  public getCardRepository(): ICardRepository {
    return this.cardRepository;
  }

  public getGroupRepository(): IGroupRepository {
    return this.groupRepository;
  }

  public getSubscriptionRepository(): ISubscriptionRepository {
    return this.subscriptionRepository;
  }

  public getStudyHistoryRepository(): IStudyHistoryRepository {
    return this.studyHistoryRepository;
  }

  public getDeckSettingRepository(): IDeckSettingRepository {
    return this.deckSettingRepository;
  }

  public getAiGenerationLimitRepository(): IAiGenerationLimitRepository {
    return this.aiGenerationLimitRepository;
  }

  public getLoginHistoryRepository(): ILoginHistoryRepository {
    return this.loginHistoryRepository;
  }

  // ユースケースの取得
  public getCreateDeckUseCase(): CreateDeckUseCase {
    return this.createDeckUseCase;
  }

  public getUpdateDeckUseCase(): UpdateDeckUseCase {
    return this.updateDeckUseCase;
  }

  public getGetDeckUseCase(): GetDeckUseCase {
    return this.getDeckUseCase;
  }

  public getDeleteDeckUseCase(): DeleteDeckUseCase {
    return this.deleteDeckUseCase;
  }

  public getUpdateDeckGroupsUseCase(): UpdateDeckGroupsUseCase {
    return this.updateDeckGroupsUseCase;
  }

  public getAddCardUseCase(): AddCardUseCase {
    return this.addCardUseCase;
  }

  public getUpdateCardUseCase(): UpdateCardUseCase {
    return this.updateCardUseCase;
  }

  public getDeleteCardUseCase(): DeleteCardUseCase {
    return this.deleteCardUseCase;
  }

  public getSaveCardsUseCase(): SaveCardsUseCase {
    return this.saveCardsUseCase;
  }

  public getStudyDeckUseCase(): StudyDeckUseCase {
    return this.studyDeckUseCase;
  }

  public getCompleteOnboardingUseCase(): CompleteOnboardingUseCase {
    return this.completeOnboardingUseCase;
  }

  public getGetUserProfileUseCase(): GetUserProfileUseCase {
    return this.getUserProfileUseCase;
  }

  public getGetOnboardingStatusUseCase(): GetOnboardingStatusUseCase {
    return this.getOnboardingStatusUseCase;
  }

  public getCreateGroupUseCase(): CreateGroupUseCase {
    return this.createGroupUseCase;
  }

  public getGetUserGroupsUseCase(): GetUserGroupsUseCase {
    return this.getUserGroupsUseCase;
  }

  public getUpdateGroupUseCase(): UpdateGroupUseCase {
    return this.updateGroupUseCase;
  }

  public getDeleteGroupUseCase(): DeleteGroupUseCase {
    return this.deleteGroupUseCase;
  }

  public getGetUserSubscriptionUseCase(): GetUserSubscriptionUseCase {
    return this.getUserSubscriptionUseCase;
  }

  public getActivateSubscriptionUseCase(): ActivateSubscriptionUseCase {
    return this.activateSubscriptionUseCase;
  }

  public getCancelSubscriptionUseCase(): CancelSubscriptionUseCase {
    return this.cancelSubscriptionUseCase;
  }

  public getCreateStudyHistoryUseCase(): CreateStudyHistoryUseCase {
    return this.createStudyHistoryUseCase;
  }

  public getGetDeckStudyHistoryUseCase(): GetDeckStudyHistoryUseCase {
    return this.getDeckStudyHistoryUseCase;
  }

  public getUpdateStudyResultUseCase(): UpdateStudyResultUseCase {
    return this.updateStudyResultUseCase;
  }

  public getCreateLoginHistoryUseCase(): CreateLoginHistoryUseCase {
    return this.createLoginHistoryUseCase;
  }

  public getGetUserLoginHistoryUseCase(): GetUserLoginHistoryUseCase {
    return this.getUserLoginHistoryUseCase;
  }

  public getGetDeckSettingUseCase(): GetDeckSettingUseCase {
    return this.getDeckSettingUseCase;
  }

  public getUpdateDeckSettingUseCase(): UpdateDeckSettingUseCase {
    return this.updateDeckSettingUseCase;
  }

  public getGetUserAiLimitUseCase(): GetUserAiLimitUseCase {
    return this.getUserAiLimitUseCase;
  }

  public getIncrementAiLimitUseCase(): IncrementAiLimitUseCase {
    return this.incrementAiLimitUseCase;
  }
}

export const container = DIContainer.getInstance();
