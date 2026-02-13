// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationBundle } from '@objectstack/spec/system';

/**
 * Todo App — Internationalization (i18n)
 *
 * Demonstrates multi-language translations covering:
 * - Object & field labels (singular / plural)
 * - Select-field option labels
 * - App navigation labels
 * - UI messages (common, success, confirm, error)
 * - Validation error messages
 *
 * Supported locales: en (English), zh-CN (Chinese), ja-JP (Japanese)
 */
export const TodoTranslations: TranslationBundle = {
  // ─── English (base) ───────────────────────────────────────────────
  en: {
    objects: {
      task: {
        label: 'Task',
        pluralLabel: 'Tasks',
        fields: {
          subject: { label: 'Subject', help: 'Brief title of the task' },
          description: { label: 'Description' },
          status: {
            label: 'Status',
            options: {
              not_started: 'Not Started',
              in_progress: 'In Progress',
              waiting: 'Waiting',
              completed: 'Completed',
              deferred: 'Deferred',
            },
          },
          priority: {
            label: 'Priority',
            options: {
              low: 'Low',
              normal: 'Normal',
              high: 'High',
              urgent: 'Urgent',
            },
          },
          category: { label: 'Category' },
          due_date: { label: 'Due Date' },
          reminder_date: { label: 'Reminder Date/Time' },
          completed_date: { label: 'Completed Date' },
          owner: { label: 'Assigned To' },
          tags: {
            label: 'Tags',
            options: {
              important: 'Important',
              quick_win: 'Quick Win',
              blocked: 'Blocked',
              follow_up: 'Follow Up',
              review: 'Review',
            },
          },
          is_recurring: { label: 'Recurring Task' },
          recurrence_type: { label: 'Recurrence Type' },
          recurrence_interval: { label: 'Recurrence Interval' },
          is_completed: { label: 'Is Completed' },
          is_overdue: { label: 'Is Overdue' },
          progress_percent: { label: 'Progress (%)' },
          estimated_hours: { label: 'Estimated Hours' },
          actual_hours: { label: 'Actual Hours' },
          notes: { label: 'Notes' },
          category_color: { label: 'Category Color' },
        },
      },
    },
    apps: {
      todo_app: {
        label: 'Todo Manager',
        description: 'Personal task management application',
      },
    },
    messages: {
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.refresh': 'Refresh',
      'common.export': 'Export',
      'common.back': 'Back',
      'common.confirm': 'Confirm',
      'success.saved': 'Successfully saved',
      'success.deleted': 'Successfully deleted',
      'success.completed': 'Task marked as completed',
      'confirm.delete': 'Are you sure you want to delete this task?',
      'confirm.complete': 'Mark this task as completed?',
      'error.required': 'This field is required',
      'error.load_failed': 'Failed to load data',
    },
    validationMessages: {
      completed_date_required: 'Completed date is required when status is Completed',
      recurrence_fields_required: 'Recurrence type is required for recurring tasks',
    },
  },

  // ─── Chinese Simplified ───────────────────────────────────────────
  'zh-CN': {
    objects: {
      task: {
        label: '任务',
        pluralLabel: '任务',
        fields: {
          subject: { label: '主题', help: '任务的简要标题' },
          description: { label: '描述' },
          status: {
            label: '状态',
            options: {
              not_started: '未开始',
              in_progress: '进行中',
              waiting: '等待中',
              completed: '已完成',
              deferred: '已推迟',
            },
          },
          priority: {
            label: '优先级',
            options: {
              low: '低',
              normal: '普通',
              high: '高',
              urgent: '紧急',
            },
          },
          category: { label: '分类' },
          due_date: { label: '截止日期' },
          reminder_date: { label: '提醒日期/时间' },
          completed_date: { label: '完成日期' },
          owner: { label: '负责人' },
          tags: {
            label: '标签',
            options: {
              important: '重要',
              quick_win: '速胜',
              blocked: '受阻',
              follow_up: '待跟进',
              review: '待审核',
            },
          },
          is_recurring: { label: '周期性任务' },
          recurrence_type: { label: '重复类型' },
          recurrence_interval: { label: '重复间隔' },
          is_completed: { label: '是否完成' },
          is_overdue: { label: '是否逾期' },
          progress_percent: { label: '进度 (%)' },
          estimated_hours: { label: '预估工时' },
          actual_hours: { label: '实际工时' },
          notes: { label: '备注' },
          category_color: { label: '分类颜色' },
        },
      },
    },
    apps: {
      todo_app: {
        label: '待办管理',
        description: '个人任务管理应用',
      },
    },
    messages: {
      'common.save': '保存',
      'common.cancel': '取消',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.create': '新建',
      'common.search': '搜索',
      'common.filter': '筛选',
      'common.sort': '排序',
      'common.refresh': '刷新',
      'common.export': '导出',
      'common.back': '返回',
      'common.confirm': '确认',
      'success.saved': '保存成功',
      'success.deleted': '删除成功',
      'success.completed': '任务已标记为完成',
      'confirm.delete': '确定要删除此任务吗？',
      'confirm.complete': '确定将此任务标记为完成？',
      'error.required': '此字段为必填项',
      'error.load_failed': '数据加载失败',
    },
    validationMessages: {
      completed_date_required: '状态为"已完成"时，完成日期为必填项',
      recurrence_fields_required: '周期性任务必须指定重复类型',
    },
  },

  // ─── Japanese ─────────────────────────────────────────────────────
  'ja-JP': {
    objects: {
      task: {
        label: 'タスク',
        pluralLabel: 'タスク',
        fields: {
          subject: { label: '件名', help: 'タスクの簡単なタイトル' },
          description: { label: '説明' },
          status: {
            label: 'ステータス',
            options: {
              not_started: '未着手',
              in_progress: '進行中',
              waiting: '待機中',
              completed: '完了',
              deferred: '延期',
            },
          },
          priority: {
            label: '優先度',
            options: {
              low: '低',
              normal: '通常',
              high: '高',
              urgent: '緊急',
            },
          },
          category: { label: 'カテゴリ' },
          due_date: { label: '期日' },
          reminder_date: { label: 'リマインダー日時' },
          completed_date: { label: '完了日' },
          owner: { label: '担当者' },
          tags: {
            label: 'タグ',
            options: {
              important: '重要',
              quick_win: 'クイックウィン',
              blocked: 'ブロック中',
              follow_up: 'フォローアップ',
              review: 'レビュー',
            },
          },
          is_recurring: { label: '繰り返しタスク' },
          recurrence_type: { label: '繰り返しタイプ' },
          recurrence_interval: { label: '繰り返し間隔' },
          is_completed: { label: '完了済み' },
          is_overdue: { label: '期限超過' },
          progress_percent: { label: '進捗率 (%)' },
          estimated_hours: { label: '見積時間' },
          actual_hours: { label: '実績時間' },
          notes: { label: 'メモ' },
          category_color: { label: 'カテゴリ色' },
        },
      },
    },
    apps: {
      todo_app: {
        label: 'ToDo マネージャー',
        description: '個人タスク管理アプリケーション',
      },
    },
    messages: {
      'common.save': '保存',
      'common.cancel': 'キャンセル',
      'common.delete': '削除',
      'common.edit': '編集',
      'common.create': '新規作成',
      'common.search': '検索',
      'common.filter': 'フィルター',
      'common.sort': '並べ替え',
      'common.refresh': '更新',
      'common.export': 'エクスポート',
      'common.back': '戻る',
      'common.confirm': '確認',
      'success.saved': '保存しました',
      'success.deleted': '削除しました',
      'success.completed': 'タスクを完了にしました',
      'confirm.delete': 'このタスクを削除してもよろしいですか？',
      'confirm.complete': 'このタスクを完了にしますか？',
      'error.required': 'この項目は必須です',
      'error.load_failed': 'データの読み込みに失敗しました',
    },
    validationMessages: {
      completed_date_required: 'ステータスが「完了」の場合、完了日は必須です',
      recurrence_fields_required: '繰り返しタスクには繰り返しタイプが必要です',
    },
  },
};
