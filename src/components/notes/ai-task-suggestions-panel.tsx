// src/components/notes/ai-task-suggestions-panel.tsx - Smart Suggestions Panel
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useTaskSuggestions } from '@/hooks/use-task-suggestions'
import { type TaskSuggestion } from '@/lib/ai/task-suggestion-engine'
import {
  Brain,
  Plus,
  X,
  RefreshCw,
  Clock,
  Target,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Activity,
  Sparkles,
  FileText,
  Users,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AITaskSuggestionsPanelProps {
  noteContent: string
  noteTitle?: string
  className?: string
}

// Priority colors and icons
const PRIORITY_CONFIG = {
  URGENT: { color: 'bg-red-500', textColor: 'text-red-700', icon: AlertTriangle },
  HIGH: { color: 'bg-orange-500', textColor: 'text-orange-700', icon: Target },
  MEDIUM: { color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: Clock },
  LOW: { color: 'bg-green-500', textColor: 'text-green-700', icon: CheckCircle2 }
}

// Category icons and colors
const CATEGORY_CONFIG = {
  bug_fix: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
  feature: { icon: Plus, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  testing: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
  documentation: { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  meeting: { icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  research: { icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  deployment: { icon: Zap, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  maintenance: { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' }
}

export function AITaskSuggestionsPanel({ 
  noteContent, 
  noteTitle, 
  className 
}: AITaskSuggestionsPanelProps) {
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  
  const {
    suggestions,
    stats,
    categorizedSuggestions,
    highPrioritySuggestions,
    isAnalyzing,
    isCreatingTask,
    createTaskFromSuggestion,
    dismissSuggestion,
    refreshSuggestions,
    clearSuggestions,
    hasContent,
    hasSuggestions,
    isEnabled
  } = useTaskSuggestions({
    noteContent,
    noteTitle,
    enabled: true,
    minContentLength: 30
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Render single suggestion card
  const renderSuggestion = (suggestion: TaskSuggestion) => {
    const priorityConfig = PRIORITY_CONFIG[suggestion.priority]
    const categoryConfig = CATEGORY_CONFIG[suggestion.category]
    const PriorityIcon = priorityConfig.icon
    const CategoryIcon = categoryConfig.icon

    return (
      <Card key={suggestion.id} className="group hover:shadow-md transition-all duration-200 overflow-y-auto h-[90vh] ">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {suggestion.description}
                </p>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => dismissSuggestion(suggestion.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Dismiss suggestion</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", priorityConfig.textColor)}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {suggestion.priority}
              </Badge>
              
              <Badge variant="outline" className={cn("text-xs", categoryConfig.color)}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {suggestion.type}
              </Badge>
              
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {suggestion.estimatedTime}
              </Badge>
            </div>

            {/* Confidence bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{suggestion.confidence}%</span>
              </div>
              <Progress value={suggestion.confidence} className="h-1" />
            </div>

            {/* Tags */}
            {suggestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {suggestion.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {suggestion.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{suggestion.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => createTaskFromSuggestion(suggestion)}
                disabled={isCreatingTask}
                className="flex-1 h-8 text-xs"
              >
                {isCreatingTask ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isEnabled) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">AI suggestions loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!hasContent) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-blue-600" />
            AI Task Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-sm mb-1">Start writing to get suggestions</h3>
          <p className="text-xs text-muted-foreground">
            AI will analyze your notes and suggest relevant tasks
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3 ">
        <div className="flex items-center justify-between ">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-blue-600" />
            AI Task Suggestions
            {isAnalyzing && <RefreshCw className="h-3 w-3 animate-spin" />}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={refreshSuggestions}
                    disabled={isAnalyzing}
                  >
                    <RefreshCw className={cn("h-3 w-3", isAnalyzing && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh suggestions</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {hasSuggestions && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={clearSuggestions}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear all suggestions</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Stats */}
        {hasSuggestions && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{stats.totalSuggestions} suggestions</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{stats.avgConfidence}% avg confidence</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>{stats.categoriesDetected.length} categories</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {isAnalyzing && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                          <Skeleton className="h-6 w-6" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-14" />
                        </div>
                        <Skeleton className="h-1 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isAnalyzing && !hasSuggestions && (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-sm mb-1">No suggestions found</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Try writing more detailed content with action items
                </p>
                <Button variant="outline" size="sm" onClick={refreshSuggestions}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Analyze Again
                </Button>
              </div>
            )}

            {!isAnalyzing && hasSuggestions && (
              <div className="space-y-4">
                {/* High Priority Section */}
                {highPrioritySuggestions.length > 0 && (
                  <div className="space-y-3">
                    <Collapsible
                      open={expandedCategories.has('priority')}
                      onOpenChange={() => toggleCategory('priority')}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto font-medium text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span>High Priority ({highPrioritySuggestions.length})</span>
                          </div>
                          {expandedCategories.has('priority') ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {highPrioritySuggestions.map(renderSuggestion)}
                      </CollapsibleContent>
                    </Collapsible>
                    <Separator />
                  </div>
                )}

                {/* All Suggestions */}
                <Collapsible
                  open={expandedCategories.has('all')}
                  onOpenChange={() => toggleCategory('all')}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-2 h-auto font-medium text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span>All Suggestions ({suggestions.length})</span>
                      </div>
                      {expandedCategories.has('all') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {suggestions.map(renderSuggestion)}
                  </CollapsibleContent>
                </Collapsible>

                {/* Categories Breakdown */}
                {Object.keys(categorizedSuggestions).length > 1 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        By Category
                      </h4>
                      {Object.entries(categorizedSuggestions).map(([category, categorySuggestions]) => {
                        const categoryConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
                        const CategoryIcon = categoryConfig?.icon || Target

                        return (
                          <Collapsible
                            key={category}
                            open={expandedCategories.has(category)}
                            onOpenChange={() => toggleCategory(category)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-between p-2 h-auto text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className={cn("h-3 w-3", categoryConfig?.color)} />
                                  <span className="capitalize">
                                    {category.replace('_', ' ')} ({categorySuggestions.length})
                                  </span>
                                </div>
                                {expandedCategories.has(category) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 mt-2 ml-4">
                              {categorySuggestions.map(renderSuggestion)}
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}