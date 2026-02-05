import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

// ============================================================================
// Better Auth Tables (required for authentication)
// ============================================================================

export const user = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

export const session = sqliteTable('session', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable(
  'account',
  {
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    password: text('password'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.providerId, table.accountId] }),
  }),
)

export const verification = sqliteTable('verification', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

// ============================================================================
// Chat/Conversation Tables (converted to SQLite)
// ============================================================================

export const conversations = sqliteTable('conversations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  archived: integer('archived', { mode: 'boolean' }).default(false).notNull(),
  externalId: text('external_id'),
  metadata: text('metadata', { mode: 'json' }), // SQLite stores JSON as text
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

export const messages = sqliteTable('messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content', { mode: 'json' }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

// ============================================================================
// Attachments
// ============================================================================

export const attachments = sqliteTable('attachments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  messageId: text('message_id').references(() => messages.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),

  storageType: text('storage_type').notNull().default('local'),
  storagePath: text('storage_path').notNull(),
  extractedText: text('extracted_text'),

  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

// ============================================================================
// User Preferences
// ============================================================================

export const preferences = sqliteTable('preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),

  theme: text('theme').default('system'),
  modelSettings: text('model_settings', { mode: 'json' })
    .default('{}')
    .notNull(),
  mcpSettings: text('mcp_settings', { mode: 'json' }).default('{}').notNull(),
  generalSettings: text('general_settings', { mode: 'json' })
    .default('{}')
    .notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

// ============================================================================
// Message Feedback
// ============================================================================

export const messageFeedback = sqliteTable('message_feedback', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rating: text('rating').notNull(), // 'up' | 'down'
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

// ============================================================================
// Saved Prompts
// ============================================================================

export const savedPrompts = sqliteTable('saved_prompts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' })
    .default(false)
    .notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false).notNull(),
  tags: text('tags', { mode: 'json' }).default('[]'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

// ============================================================================
// Conversation Shares
// ============================================================================

export const conversationShares = sqliteTable('conversation_shares', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  shareToken: text('share_token').notNull().unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert

export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert

export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export type Attachment = typeof attachments.$inferSelect
export type NewAttachment = typeof attachments.$inferInsert

export type Preference = typeof preferences.$inferSelect
export type NewPreference = typeof preferences.$inferInsert

export type MessageFeedback = typeof messageFeedback.$inferSelect
export type NewMessageFeedback = typeof messageFeedback.$inferInsert

export type SavedPrompt = typeof savedPrompts.$inferSelect
export type NewSavedPrompt = typeof savedPrompts.$inferInsert

export type ConversationShare = typeof conversationShares.$inferSelect
export type NewConversationShare = typeof conversationShares.$inferInsert
