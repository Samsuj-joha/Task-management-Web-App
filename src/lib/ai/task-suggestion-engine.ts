// src/lib/ai/task-suggestion-engine.ts - FREE AI-POWERED TASK SUGGESTIONS
'use client'

import { useLookups } from '@/hooks/use-lookups'

// Types for AI suggestions
export interface TaskSuggestion {
  id: string
  title: string
  description: string
  type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimatedTime: string
  confidence: number
  reasoning: string
  moduleId?: string
  taskTypeId?: string
  devDeptId?: string
  tags: string[]
  category: 'bug_fix' | 'feature' | 'testing' | 'documentation' | 'meeting' | 'research' | 'deployment' | 'maintenance'
}

// AI Keywords and patterns for different categories
const AI_PATTERNS = {
  bug_fix: {
    keywords: ['bug', 'error', 'issue', 'problem', 'fix', 'broken', 'not working', 'crash', 'fail'],
    phrases: ['doesn\'t work', 'not functioning', 'throws error', 'page crashes'],
    priority: 'HIGH',
    type: 'Bug Fix',
    estimatedTime: '2-4 hours'
  },
  feature: {
    keywords: ['implement', 'add', 'create', 'build', 'develop', 'feature', 'functionality', 'new'],
    phrases: ['need to add', 'should implement', 'create new', 'build feature'],
    priority: 'MEDIUM',
    type: 'Feature Development',
    estimatedTime: '1-2 days'
  },
  testing: {
    keywords: ['test', 'testing', 'unit test', 'integration', 'qa', 'quality', 'verify'],
    phrases: ['write tests', 'test coverage', 'verify functionality'],
    priority: 'MEDIUM',
    type: 'Testing',
    estimatedTime: '3-5 hours'
  },
  documentation: {
    keywords: ['document', 'readme', 'docs', 'guide', 'manual', 'instruction'],
    phrases: ['write documentation', 'update readme', 'create guide'],
    priority: 'LOW',
    type: 'Documentation',
    estimatedTime: '2-3 hours'
  },
  meeting: {
    keywords: ['meeting', 'discuss', 'call', 'sync', 'standup', 'review', 'presentation'],
    phrases: ['schedule meeting', 'team sync', 'review session'],
    priority: 'MEDIUM',
    type: 'Meeting',
    estimatedTime: '1 hour'
  },
  research: {
    keywords: ['research', 'investigate', 'analyze', 'study', 'explore', 'evaluation'],
    phrases: ['need to research', 'investigate issue', 'analyze requirements'],
    priority: 'LOW',
    type: 'Research',
    estimatedTime: '4-6 hours'
  },
  deployment: {
    keywords: ['deploy', 'release', 'publish', 'production', 'live', 'launch'],
    phrases: ['deploy to production', 'release version', 'go live'],
    priority: 'HIGH',
    type: 'Deployment',
    estimatedTime: '2-3 hours'
  },
  maintenance: {
    keywords: ['update', 'upgrade', 'maintain', 'optimize', 'refactor', 'cleanup'],
    phrases: ['code cleanup', 'performance optimization', 'dependency update'],
    priority: 'LOW',
    type: 'Maintenance',
    estimatedTime: '3-4 hours'
  }
}

// Technology-specific mappings
const TECH_MODULE_MAPPING = {
  'react': 'Frontend Development',
  'nextjs': 'Frontend Development', 
  'frontend': 'Frontend Development',
  'ui': 'UI/UX Design',
  'backend': 'Backend Development',
  'api': 'API Development',
  'database': 'Database Management',
  'sql': 'Database Management',
  'auth': 'Backend Development',
  'deployment': 'DevOps & Deployment',
  'docker': 'DevOps & Deployment',
  'mobile': 'Mobile Development',
  'ios': 'Mobile Development',
  'android': 'Mobile Development'
}

// Free AI suggestion engine class
export class TaskSuggestionEngine {
  private lookups: any
  
  constructor(lookups: any) {
    this.lookups = lookups
  }

  // Main suggestion generator
  generateSuggestions(noteContent: string, noteTitle?: string): TaskSuggestion[] {
    const content = `${noteTitle || ''} ${noteContent}`.toLowerCase()
    const suggestions: TaskSuggestion[] = []
    
    // Generate suggestions for each category
    Object.entries(AI_PATTERNS).forEach(([category, pattern]) => {
      const suggestion = this.analyzeCategoryMatch(content, category as keyof typeof AI_PATTERNS, pattern)
      if (suggestion) {
        suggestions.push(suggestion)
      }
    })

    // Sort by confidence and limit to top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  // Analyze content for specific category
  private analyzeCategoryMatch(
    content: string, 
    category: keyof typeof AI_PATTERNS, 
    pattern: typeof AI_PATTERNS[keyof typeof AI_PATTERNS]
  ): TaskSuggestion | null {
    
    let score = 0
    let foundKeywords: string[] = []
    let foundPhrases: string[] = []

    // Check keywords
    pattern.keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 1
        foundKeywords.push(keyword)
      }
    })

    // Check phrases (higher weight)
    pattern.phrases.forEach(phrase => {
      if (content.includes(phrase)) {
        score += 2
        foundPhrases.push(phrase)
      }
    })

    // Must have at least some relevance
    if (score === 0) return null

    // Calculate confidence (0-100)
    const maxPossibleScore = pattern.keywords.length + (pattern.phrases.length * 2)
    const confidence = Math.round((score / maxPossibleScore) * 100)
    
    // Must meet minimum confidence threshold
    if (confidence < 20) return null

    // Generate task title and description
    const { title, description } = this.generateTaskContent(category, foundKeywords, foundPhrases, content)
    
    // Map to actual database IDs
    const moduleId = this.findBestModuleMatch(content)
    const taskTypeId = this.findBestTaskTypeMatch(pattern.type)
    const devDeptId = this.findBestDepartmentMatch(content)

    return {
      id: `suggestion-${category}-${Date.now()}`,
      title,
      description,
      type: pattern.type,
      priority: this.calculatePriority(category, foundKeywords, content),
      estimatedTime: pattern.estimatedTime,
      confidence,
      reasoning: this.generateReasoning(foundKeywords, foundPhrases, confidence),
      moduleId,
      taskTypeId,
      devDeptId,
      tags: [...foundKeywords, category],
      category: category as TaskSuggestion['category']
    }
  }

  // Generate contextual task content
  private generateTaskContent(
    category: keyof typeof AI_PATTERNS, 
    keywords: string[], 
    phrases: string[],
    fullContent: string
  ): { title: string; description: string } {
    
    const templates = {
      bug_fix: {
        titles: [
          `Fix ${keywords[0]} issue`,
          `Resolve ${keywords[0]} problem`,
          `Debug ${keywords[0]} error`
        ],
        descriptions: [
          `Investigate and fix the ${keywords[0]} issue mentioned in the notes.`,
          `Debug and resolve the ${keywords[0]} problem affecting functionality.`,
          `Address the ${keywords[0]} error to improve system stability.`
        ]
      },
      feature: {
        titles: [
          `Implement ${keywords[0]} feature`,
          `Add ${keywords[0]} functionality`,
          `Develop ${keywords[0]} component`
        ],
        descriptions: [
          `Develop and implement the ${keywords[0]} feature as described.`,
          `Create new ${keywords[0]} functionality to enhance the application.`,
          `Build the ${keywords[0]} component according to specifications.`
        ]
      },
      testing: {
        titles: [
          `Write tests for ${keywords[0]}`,
          `Test ${keywords[0]} functionality`,
          `QA validation for ${keywords[0]}`
        ],
        descriptions: [
          `Create comprehensive tests for ${keywords[0]} functionality.`,
          `Perform quality assurance testing on ${keywords[0]} features.`,
          `Write unit and integration tests to ensure ${keywords[0]} reliability.`
        ]
      },
      documentation: {
        titles: [
          `Document ${keywords[0]} process`,
          `Create ${keywords[0]} guide`,
          `Update ${keywords[0]} documentation`
        ],
        descriptions: [
          `Create comprehensive documentation for ${keywords[0]} procedures.`,
          `Write user guide for ${keywords[0]} functionality.`,
          `Update existing documentation to include ${keywords[0]} information.`
        ]
      },
      meeting: {
        titles: [
          `Schedule ${keywords[0]} meeting`,
          `${keywords[0]} discussion session`,
          `Team sync on ${keywords[0]}`
        ],
        descriptions: [
          `Organize ${keywords[0]} meeting with relevant stakeholders.`,
          `Schedule discussion session to address ${keywords[0]} topics.`,
          `Plan team sync to review ${keywords[0]} progress and decisions.`
        ]
      },
      research: {
        titles: [
          `Research ${keywords[0]} options`,
          `Investigate ${keywords[0]} solutions`,
          `Analyze ${keywords[0]} requirements`
        ],
        descriptions: [
          `Conduct thorough research on ${keywords[0]} alternatives and solutions.`,
          `Investigate best practices for ${keywords[0]} implementation.`,
          `Analyze requirements and constraints for ${keywords[0]} project.`
        ]
      },
      deployment: {
        titles: [
          `Deploy ${keywords[0]} to production`,
          `Release ${keywords[0]} update`,
          `Launch ${keywords[0]} feature`
        ],
        descriptions: [
          `Deploy ${keywords[0]} changes to production environment.`,
          `Release ${keywords[0]} update with proper testing and validation.`,
          `Launch ${keywords[0]} feature to end users with monitoring.`
        ]
      },
      maintenance: {
        titles: [
          `Maintain ${keywords[0]} system`,
          `Update ${keywords[0]} dependencies`,
          `Optimize ${keywords[0]} performance`
        ],
        descriptions: [
          `Perform maintenance tasks for ${keywords[0]} system components.`,
          `Update ${keywords[0]} dependencies and security patches.`,
          `Optimize ${keywords[0]} performance and resource usage.`
        ]
      }
    }

    const template = templates[category]
    const randomTitle = template.titles[Math.floor(Math.random() * template.titles.length)]
    const randomDescription = template.descriptions[Math.floor(Math.random() * template.descriptions.length)]

    return {
      title: randomTitle,
      description: randomDescription
    }
  }

  // Calculate dynamic priority based on context
  private calculatePriority(
    category: keyof typeof AI_PATTERNS,
    keywords: string[],
    content: string
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    
    let priorityScore = 0
    
    // Base priority from category
    const basePriority = AI_PATTERNS[category].priority
    switch (basePriority) {
      case 'LOW': priorityScore = 1; break
      case 'MEDIUM': priorityScore = 2; break  
      case 'HIGH': priorityScore = 3; break
      case 'URGENT': priorityScore = 4; break
    }

    // Urgency indicators
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'production', 'live']
    const highWords = ['important', 'priority', 'soon', 'deadline', 'breaking']
    
    urgentWords.forEach(word => {
      if (content.includes(word)) priorityScore += 2
    })
    
    highWords.forEach(word => {
      if (content.includes(word)) priorityScore += 1
    })

    // Convert score to priority
    if (priorityScore >= 5) return 'URGENT'
    if (priorityScore >= 4) return 'HIGH'  
    if (priorityScore >= 2) return 'MEDIUM'
    return 'LOW'
  }

  // Generate reasoning for suggestion
  private generateReasoning(keywords: string[], phrases: string[], confidence: number): string {
    const keywordList = keywords.length > 0 ? keywords.join(', ') : 'none'
    const phraseList = phrases.length > 0 ? phrases.join(', ') : 'none'
    
    return `Found keywords: ${keywordList}. Detected phrases: ${phraseList}. Confidence: ${confidence}%`
  }

  // Find best matching module from database
  private findBestModuleMatch(content: string): string | undefined {
    if (!this.lookups?.modules) return undefined
    
    // Check technology keywords
    for (const [tech, moduleName] of Object.entries(TECH_MODULE_MAPPING)) {
      if (content.includes(tech)) {
        const module = this.lookups.modules.find((m: any) => 
          m.name.toLowerCase().includes(moduleName.toLowerCase())
        )
        if (module) return module.id
      }
    }

    // Fallback to first available module
    return this.lookups.modules[0]?.id
  }

  // Find best matching task type
  private findBestTaskTypeMatch(typeName: string): string | undefined {
    if (!this.lookups?.taskTypes) return undefined
    
    const taskType = this.lookups.taskTypes.find((t: any) => 
      t.name.toLowerCase().includes(typeName.toLowerCase())
    )
    return taskType?.id || this.lookups.taskTypes[0]?.id
  }

  // Find best matching department
  private findBestDepartmentMatch(content: string): string | undefined {
    if (!this.lookups?.departments) return undefined
    
    const deptKeywords = {
      'frontend': ['frontend', 'ui', 'react', 'css', 'html'],
      'backend': ['backend', 'api', 'server', 'database'],
      'qa': ['test', 'testing', 'quality', 'qa'],
      'devops': ['deploy', 'deployment', 'docker', 'ci/cd']
    }

    for (const [dept, keywords] of Object.entries(deptKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        const department = this.lookups.departments.find((d: any) => 
          d.name.toLowerCase().includes(dept)
        )
        if (department) return department.id
      }
    }

    return this.lookups.departments[0]?.id
  }
}