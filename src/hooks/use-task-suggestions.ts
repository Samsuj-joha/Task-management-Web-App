// // src/hooks/use-task-suggestions.ts - FIXED VERSION
// 'use client'

// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useDebounce } from './use-debounce'
// import { TaskSuggestionEngine, type TaskSuggestion } from '@/lib/ai/task-suggestion-engine'
// import { useLookups } from '@/hooks/use-lookups'
// import { useCreateTask } from '@/hooks/use-tasks'
// import { toast } from 'sonner'

// interface UseTaskSuggestionsProps {
//   noteContent: string
//   noteTitle?: string
//   enabled?: boolean
//   minContentLength?: number
// }

// interface SuggestionStats {
//   totalSuggestions: number
//   highConfidenceSuggestions: number
//   categoriesDetected: string[]
//   avgConfidence: number
// }

// export function useTaskSuggestions({
//   noteContent,
//   noteTitle,
//   enabled = true,
//   minContentLength = 50
// }: UseTaskSuggestionsProps) {
  
//   const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  
//   // Use refs to prevent infinite loops
//   const lastAnalyzedContentRef = useRef('')
//   const engineRef = useRef<TaskSuggestionEngine | null>(null)
  
//   // Debounce content changes to avoid excessive analysis
//   const [debouncedContent] = useDebounce(noteContent, 1000)
//   const [debouncedTitle] = useDebounce(noteTitle || '', 500)
  
//   // Get lookup data for dynamic mapping
//   const { data: lookups, isLoading: lookupsLoading } = useLookups()
  
//   // Task creation mutation
//   const createTaskMutation = useCreateTask()

//   // Initialize suggestion engine only once when lookups are available
//   useEffect(() => {
//     if (lookups && !lookupsLoading) {
//       engineRef.current = new TaskSuggestionEngine(lookups)
//     }
//   }, [lookups, lookupsLoading])

//   // Analyze content for suggestions
//   const analyzeSuggestions = useCallback(() => {
//     if (!enabled || !engineRef.current || lookupsLoading) return
//     if (debouncedContent.length < minContentLength) return
//     if (debouncedContent === lastAnalyzedContentRef.current) return

//     setIsAnalyzing(true)
    
//     try {
//       // Small delay to simulate AI processing (for better UX)
//       setTimeout(() => {
//         if (!engineRef.current) return
        
//         const newSuggestions = engineRef.current.generateSuggestions(debouncedContent, debouncedTitle)
        
//         // Filter out dismissed suggestions
//         const filteredSuggestions = newSuggestions.filter(
//           suggestion => !dismissedSuggestions.has(suggestion.id)
//         )
        
//         setSuggestions(filteredSuggestions)
//         lastAnalyzedContentRef.current = debouncedContent
        
//         console.log('🤖 AI Analysis Complete:', {
//           contentLength: debouncedContent.length,
//           suggestionsFound: filteredSuggestions.length,
//           avgConfidence: filteredSuggestions.reduce((acc, s) => acc + s.confidence, 0) / filteredSuggestions.length || 0
//         })
        
//         setIsAnalyzing(false)
//       }, 300)
      
//     } catch (error) {
//       console.error('Task suggestion analysis error:', error)
//       setSuggestions([])
//       setIsAnalyzing(false)
//     }
//   }, [
//     enabled, 
//     lookupsLoading, 
//     debouncedContent, 
//     debouncedTitle, 
//     dismissedSuggestions,
//     minContentLength
//   ])

//   // Run analysis when content changes
//   useEffect(() => {
//     analyzeSuggestions()
//   }, [debouncedContent, debouncedTitle]) // Simplified dependencies

//   // Create task from suggestion
//   const createTaskFromSuggestion = useCallback(async (suggestion: TaskSuggestion) => {
//     try {
//       const taskData = {
//         title: suggestion.title,
//         name: suggestion.title,
//         description: suggestion.description,
//         priority: suggestion.priority,
//         moduleId: suggestion.moduleId,
//         taskTypeId: suggestion.taskTypeId,
//         devDeptId: suggestion.devDeptId,
//         status: 'TODO' as const,
//         date: new Date().toISOString(),
//         tags: suggestion.tags
//       }

//       await createTaskMutation.mutateAsync(taskData)
      
//       // Dismiss this suggestion after creating
//       dismissSuggestion(suggestion.id)
      
//       toast.success(`Task "${suggestion.title}" created successfully!`)
      
//     } catch (error) {
//       console.error('Failed to create task from suggestion:', error)
//       toast.error('Failed to create task')
//     }
//   }, [createTaskMutation])

//   // Dismiss a suggestion
//   const dismissSuggestion = useCallback((suggestionId: string) => {
//     setDismissedSuggestions(prev => new Set([...prev, suggestionId]))
//     setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
//   }, [])

//   // Refresh suggestions (re-analyze)
//   const refreshSuggestions = useCallback(() => {
//     lastAnalyzedContentRef.current = ''
//     setDismissedSuggestions(new Set())
//     analyzeSuggestions()
//   }, [analyzeSuggestions])

//   // Clear all suggestions
//   const clearSuggestions = useCallback(() => {
//     setSuggestions([])
//     setDismissedSuggestions(new Set())
//   }, [])

//   // Get suggestion statistics
//   const getStats = useCallback((): SuggestionStats => {
//     const totalSuggestions = suggestions.length
//     const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 70).length
//     const categoriesDetected = [...new Set(suggestions.map(s => s.category))]
//     const avgConfidence = suggestions.length > 0 
//       ? Math.round(suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length)
//       : 0

//     return {
//       totalSuggestions,
//       highConfidenceSuggestions,
//       categoriesDetected,
//       avgConfidence
//     }
//   }, [suggestions])

//   // Get suggestions by category
//   const getSuggestionsByCategory = useCallback(() => {
//     const categorized: Record<string, TaskSuggestion[]> = {}
    
//     suggestions.forEach(suggestion => {
//       if (!categorized[suggestion.category]) {
//         categorized[suggestion.category] = []
//       }
//       categorized[suggestion.category].push(suggestion)
//     })
    
//     return categorized
//   }, [suggestions])

//   // Get high priority suggestions
//   const getHighPrioritySuggestions = useCallback(() => {
//     return suggestions.filter(s => s.priority === 'HIGH' || s.priority === 'URGENT')
//   }, [suggestions])

//   return {
//     // Data
//     suggestions,
//     stats: getStats(),
//     categorizedSuggestions: getSuggestionsByCategory(),
//     highPrioritySuggestions: getHighPrioritySuggestions(),
    
//     // Loading states
//     isAnalyzing,
//     isCreatingTask: createTaskMutation.isPending,
    
//     // Actions
//     createTaskFromSuggestion,
//     dismissSuggestion,
//     refreshSuggestions,
//     clearSuggestions,
    
//     // Status
//     hasContent: debouncedContent.length >= minContentLength,
//     hasSuggestions: suggestions.length > 0,
//     isEnabled: enabled && !lookupsLoading,
    
//     // Debug info
//     debug: {
//       contentLength: debouncedContent.length,
//       lastAnalyzed: lastAnalyzedContentRef.current.length,
//       dismissedCount: dismissedSuggestions.size,
//       lookupsLoaded: !lookupsLoading
//     }
//   }
// }




// src/hooks/use-task-suggestions.ts - OPTIMIZED FOR PERFORMANCE
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  maxSuggestions?: number
  confidenceThreshold?: number
}

interface SuggestionStats {
  totalSuggestions: number
  highConfidenceSuggestions: number
  categoriesDetected: string[]
  avgConfidence: number
  topCategory?: string
  estimatedWorkTime?: string
}

interface SuggestionHistory {
  id: string
  noteContent: string
  suggestions: TaskSuggestion[]
  createdAt: string
  stats: SuggestionStats
}

// ✅ OPTIMIZED API Functions for suggestion persistence
const saveSuggestionHistory = async (history: Omit<SuggestionHistory, 'id' | 'createdAt'>): Promise<SuggestionHistory> => {
  const response = await fetch('/api/suggestions/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(history),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save suggestion history')
  }
  
  return response.json()
}

const fetchSuggestionHistory = async (): Promise<SuggestionHistory[]> => {
  const response = await fetch('/api/suggestions/history', {
    headers: {
      'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch suggestion history')
  }
  
  return response.json()
}

const updateSuggestionFeedback = async ({ 
  suggestionId, 
  feedback 
}: { 
  suggestionId: string
  feedback: 'created' | 'dismissed' | 'helpful' | 'not_helpful' 
}): Promise<void> => {
  const response = await fetch('/api/suggestions/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suggestionId, feedback }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update suggestion feedback')
  }
}

export function useTaskSuggestions({
  noteContent,
  noteTitle,
  enabled = true,
  minContentLength = 50,
  maxSuggestions = 5,
  confidenceThreshold = 60
}: UseTaskSuggestionsProps) {
  
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [analysisCount, setAnalysisCount] = useState(0)
  
  // Use refs to prevent infinite loops and cache analysis results
  const lastAnalyzedContentRef = useRef('')
  const engineRef = useRef<TaskSuggestionEngine | null>(null)
  const analysisResultsCache = useRef<Map<string, TaskSuggestion[]>>(new Map())
  
  // ✅ OPTIMIZED Debouncing - different timeouts for title vs content
  const [debouncedContent] = useDebounce(noteContent, 1500) // Longer for content
  const [debouncedTitle] = useDebounce(noteTitle || '', 800) // Shorter for title
  
  // ✅ OPTIMIZED Lookups with React Query
  const { data: lookups, isLoading: lookupsLoading } = useLookups()
  
  // ✅ OPTIMIZED Task creation with React Query
  const createTaskMutation = useCreateTask()
  const queryClient = useQueryClient()

  // ✅ NEW Suggestion history hook
  const { data: suggestionHistory } = useQuery({
    queryKey: ['suggestions', 'history'],
    queryFn: fetchSuggestionHistory,
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes
    enabled: enabled,
  })

  // ✅ NEW Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: updateSuggestionFeedback,
    onSuccess: () => {
      // ✅ Invalidate history to reflect feedback
      queryClient.invalidateQueries({ queryKey: ['suggestions', 'history'] })
    },
  })

  // ✅ OPTIMIZED Engine initialization with memoization
  const suggestionEngine = useMemo(() => {
    if (lookups && !lookupsLoading) {
      return new TaskSuggestionEngine(lookups)
    }
    return null
  }, [lookups, lookupsLoading])

  // ✅ OPTIMIZED Content hash for cache key
  const contentHash = useMemo(() => {
    if (!debouncedContent || debouncedContent.length < minContentLength) return ''
    
    // Create a simple hash of content + title for caching
    const combined = `${debouncedContent}|${debouncedTitle}`
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  }, [debouncedContent, debouncedTitle, minContentLength])

  // ✅ OPTIMIZED Analysis with caching and performance improvements
  const analyzeSuggestions = useCallback(async () => {
    if (!enabled || !suggestionEngine || lookupsLoading) return
    if (debouncedContent.length < minContentLength) return
    if (debouncedContent === lastAnalyzedContentRef.current) return
    
    // ✅ Check cache first
    const cacheKey = contentHash
    if (cacheKey && analysisResultsCache.current.has(cacheKey)) {
      const cachedResults = analysisResultsCache.current.get(cacheKey)!
      const filteredResults = cachedResults.filter(
        suggestion => !dismissedSuggestions.has(suggestion.id)
      )
      setSuggestions(filteredResults)
      return
    }

    setIsAnalyzing(true)
    setAnalysisCount(prev => prev + 1)
    
    try {
      // ✅ Use requestIdleCallback for better performance
      const analyze = () => {
        if (!suggestionEngine) return
        
        const startTime = performance.now()
        const newSuggestions = suggestionEngine.generateSuggestions(debouncedContent, debouncedTitle)
        const analysisTime = performance.now() - startTime
        
        // ✅ Apply filters and limits
        const filteredSuggestions = newSuggestions
          .filter(suggestion => suggestion.confidence >= confidenceThreshold)
          .filter(suggestion => !dismissedSuggestions.has(suggestion.id))
          .slice(0, maxSuggestions)
        
        // ✅ Cache results for future use
        if (cacheKey) {
          analysisResultsCache.current.set(cacheKey, newSuggestions)
          
          // ✅ Limit cache size to prevent memory issues
          if (analysisResultsCache.current.size > 20) {
            const firstKey = analysisResultsCache.current.keys().next().value
            analysisResultsCache.current.delete(firstKey)
          }
        }
        
        setSuggestions(filteredSuggestions)
        lastAnalyzedContentRef.current = debouncedContent
        
        // ✅ Enhanced logging with performance metrics
        console.log('🤖 AI Analysis Complete:', {
          contentLength: debouncedContent.length,
          suggestionsFound: filteredSuggestions.length,
          avgConfidence: filteredSuggestions.reduce((acc, s) => acc + s.confidence, 0) / filteredSuggestions.length || 0,
          analysisTime: `${analysisTime.toFixed(2)}ms`,
          cacheHit: false,
          totalAnalyses: analysisCount
        })
        
        setIsAnalyzing(false)
      }

      // ✅ Use requestIdleCallback for better performance, fallback to setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(analyze, { timeout: 1000 })
      } else {
        setTimeout(analyze, 100)
      }
      
    } catch (error) {
      console.error('Task suggestion analysis error:', error)
      setSuggestions([])
      setIsAnalyzing(false)
      toast.error('Failed to analyze content for suggestions')
    }
  }, [
    enabled, 
    suggestionEngine,
    lookupsLoading, 
    debouncedContent, 
    debouncedTitle, 
    dismissedSuggestions,
    minContentLength,
    maxSuggestions,
    confidenceThreshold,
    contentHash,
    analysisCount
  ])

  // ✅ OPTIMIZED Effect with proper dependencies
  useEffect(() => {
    if (debouncedContent.length >= minContentLength) {
      analyzeSuggestions()
    } else {
      setSuggestions([])
    }
  }, [debouncedContent, debouncedTitle, analyzeSuggestions, minContentLength])

  // ✅ ENHANCED Create task from suggestion with feedback
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
        tags: suggestion.tags,
        // ✅ Add suggestion metadata
        metadata: {
          fromSuggestion: true,
          suggestionId: suggestion.id,
          confidence: suggestion.confidence,
          category: suggestion.category
        }
      }

      await createTaskMutation.mutateAsync(taskData)
      
      // ✅ Record feedback
      await feedbackMutation.mutateAsync({
        suggestionId: suggestion.id,
        feedback: 'created'
      })
      
      // ✅ Dismiss this suggestion after creating
      dismissSuggestion(suggestion.id)
      
      toast.success(`Task "${suggestion.title}" created successfully! 🎯`, {
        description: `Generated from AI analysis with ${suggestion.confidence}% confidence`,
      })
      
    } catch (error) {
      console.error('Failed to create task from suggestion:', error)
      toast.error('Failed to create task from suggestion')
    }
  }, [createTaskMutation, feedbackMutation])

  // ✅ ENHANCED Dismiss suggestion with feedback
  const dismissSuggestion = useCallback(async (suggestionId: string, feedback?: 'not_helpful') => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]))
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    
    // ✅ Record feedback if provided
    if (feedback) {
      try {
        await feedbackMutation.mutateAsync({
          suggestionId,
          feedback
        })
      } catch (error) {
        console.error('Failed to record suggestion feedback:', error)
      }
    }
  }, [feedbackMutation])

  // ✅ OPTIMIZED Refresh with cache clearing
  const refreshSuggestions = useCallback(() => {
    lastAnalyzedContentRef.current = ''
    setDismissedSuggestions(new Set())
    analysisResultsCache.current.clear() // ✅ Clear cache for fresh analysis
    setAnalysisCount(0)
    analyzeSuggestions()
  }, [analyzeSuggestions])

  // ✅ Enhanced clear with cleanup
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setDismissedSuggestions(new Set())
    analysisResultsCache.current.clear()
    lastAnalyzedContentRef.current = ''
  }, [])

  // ✅ OPTIMIZED Statistics with memoization
  const stats = useMemo((): SuggestionStats => {
    const totalSuggestions = suggestions.length
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 80).length
    const categoriesDetected = [...new Set(suggestions.map(s => s.category))]
    const avgConfidence = suggestions.length > 0 
      ? Math.round(suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length)
      : 0

    // ✅ Additional stats
    const topCategory = categoriesDetected.length > 0 
      ? suggestions.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      : {}
    
    const mostFrequentCategory = Object.entries(topCategory)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    
    const estimatedWorkTime = suggestions
      .reduce((total, s) => total + (s.estimatedTime || 0), 0)
    
    return {
      totalSuggestions,
      highConfidenceSuggestions,
      categoriesDetected,
      avgConfidence,
      topCategory: mostFrequentCategory,
      estimatedWorkTime: estimatedWorkTime > 0 ? `${estimatedWorkTime}h` : undefined
    }
  }, [suggestions])

  // ✅ OPTIMIZED Categorized suggestions with memoization
  const categorizedSuggestions = useMemo(() => {
    const categorized: Record<string, TaskSuggestion[]> = {}
    
    suggestions.forEach(suggestion => {
      if (!categorized[suggestion.category]) {
        categorized[suggestion.category] = []
      }
      categorized[suggestion.category].push(suggestion)
    })
    
    // ✅ Sort categories by suggestion count
    const sortedCategories: Record<string, TaskSuggestion[]> = {}
    Object.entries(categorized)
      .sort(([,a], [,b]) => b.length - a.length)
      .forEach(([category, suggestions]) => {
        sortedCategories[category] = suggestions.sort((a, b) => b.confidence - a.confidence)
      })
    
    return sortedCategories
  }, [suggestions])

  // ✅ OPTIMIZED High priority suggestions with memoization
  const highPrioritySuggestions = useMemo(() => {
    return suggestions
      .filter(s => s.priority === 'HIGH' || s.priority === 'URGENT')
      .sort((a, b) => b.confidence - a.confidence)
  }, [suggestions])

  // ✅ NEW Similar suggestions from history
  const similarSuggestions = useMemo(() => {
    if (!suggestionHistory || suggestions.length === 0) return []
    
    const currentCategories = new Set(suggestions.map(s => s.category))
    
    return suggestionHistory
      .filter(history => 
        history.suggestions.some(s => currentCategories.has(s.category))
      )
      .slice(0, 3) // Last 3 similar analyses
  }, [suggestionHistory, suggestions])

  // ✅ Performance metrics
  const performanceMetrics = useMemo(() => ({
    cacheSize: analysisResultsCache.current.size,
    totalAnalyses: analysisCount,
    avgSuggestionsPerAnalysis: analysisCount > 0 ? suggestions.length / analysisCount : 0,
    dismissedCount: dismissedSuggestions.size,
    cacheHitRate: analysisCount > 0 ? (analysisCount - analysisResultsCache.current.size) / analysisCount : 0
  }), [analysisCount, suggestions.length, dismissedSuggestions.size])

  return {
    // ✅ Core Data
    suggestions,
    stats,
    categorizedSuggestions,
    highPrioritySuggestions,
    similarSuggestions,
    
    // ✅ Loading States
    isAnalyzing,
    isCreatingTask: createTaskMutation.isPending,
    isRecordingFeedback: feedbackMutation.isPending,
    
    // ✅ Enhanced Actions
    createTaskFromSuggestion,
    dismissSuggestion,
    refreshSuggestions,
    clearSuggestions,
    
    // ✅ Status Flags
    hasContent: debouncedContent.length >= minContentLength,
    hasSuggestions: suggestions.length > 0,
    isEnabled: enabled && !lookupsLoading && !!suggestionEngine,
    hasHistory: (suggestionHistory?.length || 0) > 0,
    
    // ✅ Configuration
    config: {
      minContentLength,
      maxSuggestions,
      confidenceThreshold,
      enabled
    },
    
    // ✅ Enhanced Debug Info
    debug: {
      contentLength: debouncedContent.length,
      contentHash,
      lastAnalyzed: lastAnalyzedContentRef.current.length,
      dismissedCount: dismissedSuggestions.size,
      lookupsLoaded: !lookupsLoading,
      engineReady: !!suggestionEngine,
      performance: performanceMetrics
    }
  }
}

// ✅ NEW Utility hooks for suggestion management

// Hook for suggestion analytics
export function useSuggestionAnalytics() {
  return useQuery({
    queryKey: ['suggestions', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/suggestions/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
    staleTime: 30 * 60 * 1000, // ✅ 30 minutes
  })
}

// Hook for suggestion templates
export function useSuggestionTemplates() {
  return useQuery({
    queryKey: ['suggestions', 'templates'],
    queryFn: async () => {
      const response = await fetch('/api/suggestions/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      return response.json()
    },
    staleTime: 60 * 60 * 1000, // ✅ 1 hour - templates are very stable
  })
}

// ✅ Export types
export type { UseTaskSuggestionsProps, SuggestionStats, SuggestionHistory }