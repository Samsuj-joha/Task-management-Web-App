// src/utils/excel-export.ts
import { format } from 'date-fns'

interface ExcelTaskData {
  'Serial No': number
  'Task ID': string
  'Task Name': string
  'Description': string
  'Status': string
  'Priority': string
  'Module': string
  'Task Type': string
  'Department': string
  'Tracking No': string
  'Created Date': string
  'Due Date': string
  'Completed Date': string
  'Days to Complete': string
  'Assigned To': string
  'Created By': string
  'Project': string
  'Sub Task': string
  'Reference': string
  'Sent By': string
  'Solve Date': string
  'Comments': string
  'Modifications': string
  'Is Overdue': string
  'Completion Rate': string
}

interface ExcelProjectData {
  'Serial No': number
  'Project ID': string
  'Project Name': string
  'Description': string
  'Status': string
  'Priority': string
  'Start Date': string
  'End Date': string
  'Created Date': string
  'Owner': string
  'Total Tasks': number
  'Completed Tasks': number
  'In Progress Tasks': number
  'Progress %': string
  'Team Members': number
  'Budget': string
  'Days Active': string
  'Is Overdue': string
}

export class ExcelExporter {
  private static formatDate(dateString?: string): string {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  private static calculateDaysToComplete(createdAt: string, completedAt?: string): string {
    if (!completedAt) return 'Not Completed'
    try {
      const created = new Date(createdAt)
      const completed = new Date(completedAt)
      const diffTime = completed.getTime() - created.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} days`
    } catch {
      return 'Unknown'
    }
  }

  private static calculateDaysActive(createdAt: string): string {
    try {
      const created = new Date(createdAt)
      const now = new Date()
      const diffTime = now.getTime() - created.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} days`
    } catch {
      return 'Unknown'
    }
  }

  static exportTasksToExcel(tasks: any[], projects: any[] = []) {
    // Prepare task data
    const taskData: ExcelTaskData[] = tasks.map((task, index) => {
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
      const projectName = task.project ? task.project.name : 'No Project'
      
      return {
        'Serial No': index + 1,
        'Task ID': task.id || 'N/A',
        'Task Name': task.name || task.title || 'Untitled',
        'Description': task.comments || task.description || 'No description',
        'Status': task.status || 'Unknown',
        'Priority': task.priority || 'Unknown',
        'Module': task.module || 'Unassigned',
        'Task Type': task.taskType || 'General',
        'Department': task.devDept || 'Unassigned',
        'Tracking No': task.trackingNo || 'N/A',
        'Created Date': this.formatDate(task.createdAt),
        'Due Date': this.formatDate(task.dueDate),
        'Completed Date': this.formatDate(task.completedAt),
        'Days to Complete': this.calculateDaysToComplete(task.createdAt, task.completedAt),
        'Assigned To': task.assignee?.name || 'Unassigned',
        'Created By': task.creator?.name || 'Unknown',
        'Project': projectName,
        'Sub Task': task.subTask || 'N/A',
        'Reference': task.reference || 'N/A',
        'Sent By': task.sentBy || 'N/A',
        'Solve Date': this.formatDate(task.solveDate),
        'Comments': task.comments || 'No comments',
        'Modifications': task.modify || 'No modifications',
        'Is Overdue': isOverdue ? 'YES' : 'NO',
        'Completion Rate': task.status === 'COMPLETED' ? '100%' : task.status === 'IN_PROGRESS' ? '50%' : '0%'
      }
    })

    // Prepare project data
    const projectData: ExcelProjectData[] = projects.map((project, index) => {
      const totalTasks = project._count?.tasks || 0
      const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0
      const inProgressTasks = project.tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'COMPLETED'

      return {
        'Serial No': index + 1,
        'Project ID': project.id || 'N/A',
        'Project Name': project.name || 'Untitled',
        'Description': project.description || 'No description',
        'Status': project.status || 'Unknown',
        'Priority': project.priority || 'Unknown',
        'Start Date': this.formatDate(project.startDate),
        'End Date': this.formatDate(project.endDate),
        'Created Date': this.formatDate(project.createdAt),
        'Owner': project.owner?.name || 'Unknown',
        'Total Tasks': totalTasks,
        'Completed Tasks': completedTasks,
        'In Progress Tasks': inProgressTasks,
        'Progress %': `${progressPercentage}%`,
        'Team Members': project._count?.members || 0,
        'Budget': project.budget ? `$${project.budget.toLocaleString()}` : 'N/A',
        'Days Active': this.calculateDaysActive(project.createdAt),
        'Is Overdue': isOverdue ? 'YES' : 'NO'
      }
    })

    // Calculate summary statistics
    const summaryData = {
      'Total Tasks': tasks.length,
      'Completed Tasks': tasks.filter(t => t.status === 'COMPLETED').length,
      'In Progress Tasks': tasks.filter(t => t.status === 'IN_PROGRESS').length,
      'Overdue Tasks': tasks.filter(t => {
        return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
      }).length,
      'Total Projects': projects.length,
      'Active Projects': projects.filter(p => p.status === 'ACTIVE').length,
      'Completed Projects': projects.filter(p => p.status === 'COMPLETED').length,
      'Export Date': format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
      'Report Generated By': 'TaskFlow Analytics System'
    }

    // Create CSV content for tasks
    const taskHeaders = Object.keys(taskData[0] || {}).join(',')
    const taskRows = taskData.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n')

    // Create CSV content for projects
    const projectHeaders = Object.keys(projectData[0] || {}).join(',')
    const projectRows = projectData.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n')

    // Create summary CSV
    const summaryHeaders = 'Metric,Value'
    const summaryRows = Object.entries(summaryData).map(([key, value]) => `${key},${value}`).join('\n')

    // Combine all data
    const csvContent = [
      '=== TASKFLOW ANALYTICS REPORT ===',
      '',
      '=== SUMMARY STATISTICS ===',
      summaryHeaders,
      summaryRows,
      '',
      '=== TASKS DETAILED REPORT ===',
      taskHeaders,
      taskRows,
      '',
      '=== PROJECTS DETAILED REPORT ===',
      projectHeaders,
      projectRows,
      '',
      '=== END OF REPORT ===',
      `Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
      'TaskFlow Analytics System'
    ].join('\n')

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `TaskFlow_Analytics_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      success: true,
      message: 'Excel report exported successfully!',
      fileName: `TaskFlow_Analytics_Report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`,
      recordsExported: {
        tasks: tasks.length,
        projects: projects.length,
        summary: Object.keys(summaryData).length
      }
    }
  }

  // Advanced Excel export with XLSX library (if available)
  static async exportToXLSX(tasks: any[], projects: any[] = []) {
    try {
      // This would require installing xlsx library
      // npm install xlsx
      // For now, we'll use CSV which opens perfectly in Excel
      
      return this.exportTasksToExcel(tasks, projects)
    } catch (error) {
      console.error('XLSX export failed, falling back to CSV:', error)
      return this.exportTasksToExcel(tasks, projects)
    }
  }

  // Quick export for just tasks
  static exportTasksOnly(tasks: any[]) {
    return this.exportTasksToExcel(tasks, [])
  }

  // Quick export for just projects  
  static exportProjectsOnly(projects: any[]) {
    return this.exportTasksToExcel([], projects)
  }
}