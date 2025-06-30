// src/app/dashboard/tasks/page.tsx
'use client'

import { useState } from 'react'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { type Task } from '@/hooks/use-tasks'

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  const handleCreateTask = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedTask(undefined)
  }

  return (
    <>
      <TaskList 
        onCreateTask={handleCreateTask}
        onEditTask={handleEditTask}
      />

      {/* Create Task Modal */}
      <TaskForm
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        mode="create"
      />

      {/* Edit Task Modal */}
      <TaskForm
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={selectedTask}
        mode="edit"
      />
    </>
  )
}