// 通知のメタデータ型
export type NotificationMetadata = {
  feedback_id?: string;
  project_title?: string;
  is_anonymous?: boolean;
  provider_user_id?: string | null;
  provider_display_name?: string | null;
  provider_avatar_url?: string | null;
  [key: string]: any; // その他のメタデータフィールド用
};

// 通知型
export type Notification = {
  id: string;
  user_id: string;
  project_id: string | null;
  message: string;
  type: string; // 'feedback_received' | 'project_active' | 'test_notification' などの値
  is_read: boolean;
  metadata: NotificationMetadata;
  created_at: string;
  updated_at: string;
};
