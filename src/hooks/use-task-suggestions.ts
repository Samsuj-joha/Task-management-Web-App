// src/hooks/use-task-suggestions.ts - FIXED VERSION
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounce } from './use-debounce'
import { TaskSuggestionEngine, type TaskSuggestion } from '@/lib/ai/task-suggestion-engine'
import { useLookups } from '@/hooks/use-lookups'
import { useCreateTask } from '@/hooks/use-tasks'
import { toast } from 'sonner'

interface UseTaskSuggestionsProps {
  noteContent: string
  noteTitle?: string
  enabled?: boolean
  minContentLength?: number
}

interface SuggestionStats {
  totalSuggestions: number
  highConfidenceSuggestions: number
  categoriesDetected: string[]
  avgConfidence: number
}

export function useTaskSuggestions({
  noteContent,
  noteTitle,
  enabled = true,
  minContentLength = 50
}: UseTaskSuggestionsProps) {
  
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  
  // Use refs to prevent infinite loops
  const lastAnalyzedContentRef = useRef('')
  const engineRef = useRef<TaskSuggestionEngine | null>(null)
  
  // Debounce content changes to avoid excessive analysis
  const [debouncedContent] = useDebounce(noteContent, 1000)
  const [debouncedTitle] = useDebounce(noteTitle || '', 500)
  
  // Get lookup data for dynamic mapping
  const { data: lookups, isLoading: lookupsLoading } = useLookups()
  
  // Task creation mutation
  const createTaskMutation = useCreateTask()

  // Initialize suggestion engine only once when lookups are available
  useEffect(() => {
    if (lookups && !lookupsLoading) {
      engineRef.current = new TaskSuggestionEngine(lookups)
    }
  }, [lookups, lookupsLoading])

  // Analyze content for suggestions
  const analyzeSuggestions = useCallback(() => {
    if (!enabled || !engineRef.current || lookupsLoading) return
    if (debouncedContent.length < minContentLength) return
    if (debouncedContent === lastAnalyzedContentRef.current) return

    setIsAnalyzing(true)
    
    try {
      // Small delay to simulate AI processing (for better UX)
      setTimeout(() => {
        if (!engineRef.current) return
        
        const newSuggestions = engineRef.current.generateSuggestions(debouncedContent, debouncedTitle)
        
        // Filter out dismissed suggestions
        const filteredSuggestions = newSuggestions.filter(
          suggestion => !dismissedSuggestions.has(suggestion.id)
        )
        
        setSuggestions(filteredSuggestions)
        lastAnalyzedContentRef.current = debouncedContent
        
        console.log('🤖 AI Analysis Complete:', {
          contentLength: debouncedContent.length,
          suggestionsFound: filteredSuggestions.length,
          avgConfidence: filteredSuggestions.reduce((acc, s) => acc + s.confidence, 0) / filteredSuggestions.length || 0
        })
        
        setIsAnalyzing(false)
      }, 300)
      
    } catch (error) {
      console.error('Task suggestion analysis error:', error)
      setSuggestions([])
      setIsAnalyzing(false)
    }
  }, [
    enabled, 
    lookupsLoading, 
    debouncedContent, 
    debouncedTitle, 
    dismissedSuggestions,
    minContentLength
  ])

  // Run analysis when content changes
  useEffect(() => {
    analyzeSuggestions()
  }, [debouncedContent, debouncedTitle]) // Simplified dependencies

  // Create task from suggestion
  const createTaskFromSuggestion = useCallback(async (suggestion: TaskSuggestion) => {
    try {
      const taskData = {
        title: suggestion.title,
        name: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        moduleId: suggestion.moduleId,
        taskTypeId: suggestion.taskTypeId,
        devDeptId: suggestion.devDeptId,
        status: 'TODO' as const,
        date: new Date().toISOString(),
        tags: suggestion.tags
      }

      await createTaskMutation.mutateAsync(taskData)
      
      // Dismiss this suggestion after creating
      dismissSuggestion(suggestion.id)
      
      toast.success(`Task "${suggestion.title}" created successfully!`)
      
    } catch (error) {
      console.error('Failed to create task from suggestion:', error)
      toast.error('Failed to create task')
    }
  }, [createTaskMutation])

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]))
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }, [])

  // Refresh suggestions (re-analyze)
  const refreshSuggestions = useCallback(() => {
    lastAnalyzedContentRef.current = ''
    setDismissedSuggestions(new Set())
    analyzeSuggestions()
  }, [analyzeSuggestions])

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setDismissedSuggestions(new Set())
  }, [])

  // Get suggestion statistics
  const getStats = useCallback((): SuggestionStats => {
    const totalSuggestions = suggestions.length
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 70).length
    const categoriesDetected = [...new Set(suggestions.map(s => s.category))]
    const avgConfidence = suggestions.length > 0 
      ? Math.round(suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length)
      : 0

    return {
      totalSuggestions,
      highConfidenceSuggestions,
      categoriesDetected,
      avgConfidence
    }
  }, [suggestions])

  // Get suggestions by category
  const getSuggestionsByCategory = useCallback(() => {
    const categorized: Record<string, TaskSuggestion[]> = {}
    
    suggestions.forEach(suggestion => {
      if (!categorized[suggestion.category]) {
        categorized[suggestion.category] = []
      }
      categorized[suggestion.category].push(suggestion)
    })
    
    return categorized
  }, [suggestions])

  // Get high priority suggestions
  const getHighPrioritySuggestions = useCallback(() => {
    return suggestions.filter(s => s.priority === 'HIGH' || s.priority === 'URGENT')
  }, [suggestions])

  return {
    // Data
    suggestions,
    stats: getStats(),
    categorizedSuggestions: getSuggestionsByCategory(),
    highPrioritySuggestions: getHighPrioritySuggestions(),
    
    // Loading states
    isAnalyzing,
    isCreatingTask: createTaskMutation.isPending,
    
    // Actions
    createTaskFromSuggestion,
    dismissSuggestion,
    refreshSuggestions,
    clearSuggestions,
    
    // Status
    hasContent: debouncedContent.length >= minContentLength,
    hasSuggestions: suggestions.length > 0,
    isEnabled: enabled && !lookupsLoading,
    
    // Debug info
    debug: {
      contentLength: debouncedContent.length,
      lastAnalyzed: lastAnalyzedContentRef.current.length,
      dismissedCount: dismissedSuggestions.size,
      lookupsLoaded: !lookupsLoading
    }
  }
}