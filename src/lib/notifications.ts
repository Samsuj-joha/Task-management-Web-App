// src/lib/notifications.ts - Real-time Notification Utilities

export interface NotificationEvent {
  type: 'task_created' | 'task_updated' | 'task_status_changed' | 'task_deleted' | 'project_created' | 'project_updated'
  taskId?: string
  taskName?: string
  projectId?: string
  projectName?: string
  oldStatus?: string
  newStatus?: string
  userId?: string
  data?: any
}

/**
 * Dispatch a real-time notification event
 */
export function dispatchNotificationEvent(event: NotificationEvent) {
  // Dispatch custom event for real-time updates
  const customEvent = new CustomEvent('taskUpdated', {
    detail: event
  })
  
  window.dispatchEvent(customEvent)
  
  console.log('🔔 Notification event dispatched:', event)
}

/**
 * Helper functions for common notification events
 */
export const NotificationEvents = {
  /**
   * Task was created
   */
  taskCreated: (taskId: string, taskName: string, userId?: string) => {
    dispatchNotificationEvent({
      type: 'task_created',
      taskId,
      taskName,
      userId
    })
  },

  /**
   * Task status was changed
   */
  taskStatusChanged: (taskId: string, taskName: string, oldStatus: string, newStatus: string, userId?: string) => {
    dispatchNotificationEvent({
      type: 'task_status_changed',
      taskId,
      taskName,
      oldStatus,
      newStatus,
      userId
    })
  },

  /**
   * Task was updated (general)
   */
  taskUpdated: (taskId: string, taskName: string, data?: any, userId?: string) => {
    dispatchNotificationEvent({
      type: 'task_updated',
      taskId,
      taskName,
      data,
      userId
    })
  },

  /**
   * Task was deleted
   */
  taskDeleted: (taskId: string, taskName: string, userId?: string) => {
    dispatchNotificationEvent({
      type: 'task_deleted',
      taskId,
      taskName,
      userId
    })
  },

  /**
   * Project was created
   */
  projectCreated: (projectId: string, projectName: string, userId?: string) => {
    const customEvent = new CustomEvent('projectUpdated', {
      detail: {
        type: 'project_created',
        projectId,
        projectName,
        userId
      }
    })
    window.dispatchEvent(customEvent)
  },

  /**
   * Project was updated
   */
  projectUpdated: (projectId: string, projectName: string, data?: any, userId?: string) => {
    const customEvent = new CustomEvent('projectUpdated', {
      detail: {
        type: 'project_updated',
        projectId,
        projectName,
        data,
        userId
      }
    })
    window.dispatchEvent(customEvent)
  }
}

/**
 * Storage utilities for notifications
 */
export const NotificationStorage = {
  /**
   * Get read notifications from localStorage
   */
  getReadNotifications: (): Set<string> => {
    if (typeof window === 'undefined') return new Set()
    
    try {
      const stored = localStorage.getItem('taskflow_read_notifications')
      if (stored) {
        return new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.warn('Failed to load read notifications:', error)
    }
    
    return new Set()
  },

  /**
   * Save read notifications to localStorage
   */
  saveReadNotifications: (readIds: Set<string>) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('taskflow_read_notifications', JSON.stringify([...readIds]))
    } catch (error) {
      console.warn('Failed to save read notifications:', error)
    }
  },

  /**
   * Clear all read notifications
   */
  clearReadNotifications: () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem('taskflow_read_notifications')
    } catch (error) {
      console.warn('Failed to clear read notifications:', error)
    }
  }
}