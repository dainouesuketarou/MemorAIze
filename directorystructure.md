.
├── app
│ ├── (auth)
│ │ ├── auth
│ │ │ ├── email-sent
│ │ │ │ └── page.tsx
│ │ │ └── error
│ │ │ └── page.tsx
│ │ └── login
│ │ └── page.tsx
│ ├── (dashboard)
│ │ ├── create
│ │ │ └── page.tsx
│ │ ├── dashboard
│ │ │ └── page.tsx
│ │ ├── deck
│ │ │ └── [deckId]
│ │ │ ├── cards
│ │ │ │ └── page.tsx
│ │ │ └── page.tsx
│ │ └── study
│ │ └── [deckId]
│ │ └── page.tsx
│ ├── api
│ │ ├── ai-generation-limit
│ │ │ └── route.ts
│ │ ├── auth
│ │ │ └── [...nextauth]
│ │ │ └── route.ts
│ │ ├── cards
│ │ │ ├── [cardId]
│ │ │ │ └── route.ts
│ │ │ ├── add
│ │ │ │ └── route.ts
│ │ │ ├── route.ts
│ │ │ └── save
│ │ │ └── route.ts
│ │ ├── decks
│ │ │ ├── [deckId]
│ │ │ │ ├── group
│ │ │ │ │ └── route.ts
│ │ │ │ ├── route.ts
│ │ │ │ └── settings
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── generate
│ │ │ └── route.ts
│ │ ├── groups
│ │ │ └── route.ts
│ │ ├── study
│ │ │ └── [deckId]
│ │ │ ├── history
│ │ │ │ └── route.ts
│ │ │ └── result
│ │ │ └── route.ts
│ │ └── upload
│ │ └── route.ts
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── components
│ ├── auth
│ │ └── email-auth-form.tsx
│ ├── cards
│ │ ├── ai-generate-form.tsx
│ │ ├── card-add-ai-form.tsx
│ │ ├── card-add-manual-form.tsx
│ │ ├── card-edit-form.tsx
│ │ ├── generating-cards.tsx
│ │ ├── manual-create-form.tsx
│ │ └── preview-cards.tsx
│ ├── dashboard
│ │ ├── ai-limit-badge.tsx
│ │ ├── deck-list.tsx
│ │ ├── header.tsx
│ │ ├── main-nav.tsx
│ │ ├── shell.tsx
│ │ ├── sidebar.tsx
│ │ └── user-nav.tsx
│ ├── deck-card.tsx
│ ├── decks
│ │ └── deck-edit-form.tsx
│ ├── group-modal.tsx
│ ├── landing
│ │ ├── features.tsx
│ │ ├── footer.tsx
│ │ ├── hero.tsx
│ │ └── pricing.tsx
│ ├── loading.tsx
│ ├── providers.tsx
│ ├── study
│ │ └── SettingModal.tsx
│ ├── SyncSessionToRedux.tsx
│ ├── theme-provider.tsx
│ ├── theme-toggle.tsx
│ └── ui
│ ├── accordion.tsx
│ ├── alert-dialog.tsx
│ ├── alert.tsx
│ ├── aspect-ratio.tsx
│ ├── avatar.tsx
│ ├── badge.tsx
│ ├── breadcrumb.tsx
│ ├── button.tsx
│ ├── calendar.tsx
│ ├── card.tsx
│ ├── carousel.tsx
│ ├── chart.tsx
│ ├── checkbox.tsx
│ ├── collapsible.tsx
│ ├── command.tsx
│ ├── context-menu.tsx
│ ├── dialog.tsx
│ ├── drawer.tsx
│ ├── dropdown-menu.tsx
│ ├── form.tsx
│ ├── hover-card.tsx
│ ├── input-otp.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── menubar.tsx
│ ├── navigation-menu.tsx
│ ├── pagination.tsx
│ ├── popover.tsx
│ ├── progress.tsx
│ ├── radio-group.tsx
│ ├── resizable.tsx
│ ├── scroll-area.tsx
│ ├── select.tsx
│ ├── separator.tsx
│ ├── sheet.tsx
│ ├── skeleton.tsx
│ ├── slider.tsx
│ ├── sonner.tsx
│ ├── switch.tsx
│ ├── table.tsx
│ ├── tabs.tsx
│ ├── textarea.tsx
│ ├── toast.tsx
│ ├── toaster.tsx
│ ├── toggle-group.tsx
│ ├── toggle.tsx
│ ├── tooltip.tsx
│ └── use-toast.tsx
├── components.json
├── directorystructure.md
├── eslint.config.mjs
├── hooks
│ ├── use-ai-generation-limit.ts
│ ├── use-toast.ts
│ └── useDeckSetting.ts
├── lib
│ ├── auth.ts
│ ├── email.ts
│ ├── jwt.ts
│ ├── prisma.ts
│ ├── speech.ts
│ └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── prettier.config.js
├── prisma
│ ├── migrations
│ │ ├── 20250509132209_init
│ │ │ └── migration.sql
│ │ ├── 20250509133648_add_card_model
│ │ │ └── migration.sql
│ │ ├── 20250509175704_add_mastered_to_card
│ │ │ └── migration.sql
│ │ ├── 20250509183026_add_study_history
│ │ │ └── migration.sql
│ │ ├── 20250510150618_add_card_status
│ │ │ └── migration.sql
│ │ ├── 20250513130438_add_user_deck_relation
│ │ │ └── migration.sql
│ │ ├── 20250513132758_add_group_fields
│ │ │ └── migration.sql
│ │ ├── 20250513165046_add_order_to_cards
│ │ │ └── migration.sql
│ │ ├── 20250516060818_add_email_verification
│ │ │ └── migration.sql
│ │ ├── 20250516063104_add_email
│ │ │ └── migration.sql
│ │ ├── 20250516064147_add_nextauth_tables
│ │ │ └── migration.sql
│ │ ├── 20250516064755_make_provider_fields_optional
│ │ │ └── migration.sql
│ │ ├── 20250516183006_remove_unused_columns
│ │ │ └── migration.sql
│ │ ├── 20250516191050_remove_verificationtoken_id
│ │ │ └── migration.sql
│ │ ├── 20250517061420_add_limit_ai
│ │ │ └── migration.sql
│ │ ├── 20250517163217_add_deck_setting_and_card_favorite
│ │ │ └── migration.sql
│ │ ├── 20250517171141_update_filter_mode
│ │ │ └── migration.sql
│ │ ├── 20250521162219_add_cascade_delete_to_deck_settings
│ │ │ └── migration.sql
│ │ └── migration_lock.toml
│ └── schema.prisma
├── store
│ ├── cardSlice.ts
│ ├── deckSlice.ts
│ ├── groupSlice.ts
│ ├── index.ts
│ ├── studyHistorySlice.ts
│ └── userSlice.ts
├── tailwind.config.ts
├── technologystack.md
├── tmp
├── tsconfig.json
├── types
│ ├── deck.ts
│ ├── next-auth.d.ts
│ └── pdf-parse.d.ts
└── types.ts
