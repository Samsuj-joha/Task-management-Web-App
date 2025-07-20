// src/lib/ai/task-suggestion-engine.ts - IMPROVED VERSION
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

// Enhanced AI Keywords and patterns
const AI_PATTERNS = {
  bug_fix: {
    keywords: ['bug', 'error', 'issue', 'problem', 'fix', 'broken', 'not working', 'crash', 'fail', 'glitch', 'malfunction'],
    phrases: ['doesn\'t work', 'not functioning', 'throws error', 'page crashes', 'system down', 'broken feature'],
    priority: 'HIGH',
    type: 'Bug Fix',
    estimatedTime: '2-4 hours',
    confidenceWeight: 3
  },
  feature: {
    keywords: ['implement', 'add', 'create', 'build', 'develop', 'feature', 'functionality', 'new', 'enhancement', 'improve'],
    phrases: ['need to add', 'should implement', 'create new', 'build feature', 'add functionality', 'develop component'],
    priority: 'MEDIUM',
    type: 'Feature Development',
    estimatedTime: '1-2 days',
    confidenceWeight: 2
  },
  testing: {
    keywords: ['test', 'testing', 'unit test', 'integration', 'qa', 'quality', 'verify', 'validate', 'check'],
    phrases: ['write tests', 'test coverage', 'verify functionality', 'quality assurance', 'test cases'],
    priority: 'MEDIUM',
    type: 'Testing',
    estimatedTime: '3-5 hours',
    confidenceWeight: 2
  },
  documentation: {
    keywords: ['document', 'readme', 'docs', 'guide', 'manual', 'instruction', 'wiki', 'help'],
    phrases: ['write documentation', 'update readme', 'create guide', 'document process', 'user manual'],
    priority: 'LOW',
    type: 'Documentation',
    estimatedTime: '2-3 hours',
    confidenceWeight: 1
  },
  meeting: {
    keywords: ['meeting', 'discuss', 'call', 'sync', 'standup', 'review', 'presentation', 'demo'],
    phrases: ['schedule meeting', 'team sync', 'review session', 'stakeholder meeting', 'demo session'],
    priority: 'MEDIUM',
    type: 'Meeting',
    estimatedTime: '1 hour',
    confidenceWeight: 2
  },
  research: {
    keywords: ['research', 'investigate', 'analyze', 'study', 'explore', 'evaluation', 'compare', 'assess'],
    phrases: ['need to research', 'investigate issue', 'analyze requirements', 'study options', 'explore solutions'],
    priority: 'LOW',
    type: 'Research',
    estimatedTime: '4-6 hours',
    confidenceWeight: 1
  },
  deployment: {
    keywords: ['deploy', 'release', 'publish', 'production', 'live', 'launch', 'ship', 'go-live'],
    phrases: ['deploy to production', 'release version', 'go live', 'publish update', 'launch feature'],
    priority: 'HIGH',
    type: 'Deployment',
    estimatedTime: '2-3 hours',
    confidenceWeight: 3
  },
  maintenance: {
    keywords: ['update', 'upgrade', 'maintain', 'optimize', 'refactor', 'cleanup', 'improve', 'enhance'],
    phrases: ['code cleanup', 'performance optimization', 'dependency update', 'refactor code', 'system maintenance'],
    priority: 'LOW',
    type: 'Maintenance',
    estimatedTime: '3-4 hours',
    confidenceWeight: 1
  }
}

// Smart task title templates
const SMART_TITLES = {
  bug_fix: [
    'Fix {subject} issue',
    'Resolve {subject} problem',
    'Debug {subject} error',
    'Repair {subject} malfunction'
  ],
  feature: [
    'Implement {subject} feature',
    'Add {subject} functionality',
    'Create {subject} component',
    'Build {subject} system'
  ],
  testing: [
    'Test {subject} functionality',
    'Write tests for {subject}',
    'Validate {subject} behavior',
    'QA {subject} feature'
  ],
  documentation: [
    'Document {subject} process',
    'Create {subject} guide',
    'Write {subject} documentation',
    'Update {subject} docs'
  ],
  meeting: [
    'Schedule {subject} meeting',
    'Discuss {subject} requirements',
    'Review {subject} progress',
    'Plan {subject} strategy'
  ],
  research: [
    'Research {subject} options',
    'Investigate {subject} solutions',
    'Analyze {subject} requirements',
    'Study {subject} alternatives'
  ],
  deployment: [
    'Deploy {subject} to production',
    'Release {subject} update',
    'Launch {subject} feature',
    'Ship {subject} version'
  ],
  maintenance: [
    'Optimize {subject} performance',
    'Refactor {subject} code',
    'Update {subject} dependencies',
    'Maintain {subject} system'
  ]
}

// Enhanced AI suggestion engine
export class TaskSuggestionEngine {
  private lookups: any
  
  constructor(lookups: any) {
    this.lookups = lookups
  }

  // Main suggestion generator with improved logic
  generateSuggestions(noteContent: string, noteTitle?: string): TaskSuggestion[] {
    const fullText = `${noteTitle || ''} ${noteContent}`.toLowerCase().trim()
    
    if (fullText.length < 10) {
      return [] // Not enough content to analyze
    }

    const suggestions: TaskSuggestion[] = []
    
    // Generate suggestions for each category
    Object.entries(AI_PATTERNS).forEach(([category, pattern]) => {
      const suggestion = this.analyzeCategoryMatch(fullText, category as keyof typeof AI_PATTERNS, pattern, noteTitle)
      if (suggestion && suggestion.confidence >= 60) { // Higher confidence threshold
        suggestions.push(suggestion)
      }
    })

    // Sort by confidence and limit to top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  // Enhanced category analysis
  private analyzeCategoryMatch(
    content: string,
    category: keyof typeof AI_PATTERNS,
    pattern: typeof AI_PATTERNS[keyof typeof AI_PATTERNS],
    noteTitle?: string
  ): TaskSuggestion | null {
    
    let keywordScore = 0
    let phraseScore = 0
    let foundKeywords: string[] = []
    let foundPhrases: string[] = []
    let contextSubject = this.extractContextSubject(content, noteTitle)

    // Enhanced keyword detection
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches) {
        keywordScore += matches.length * 10
        if (!foundKeywords.includes(keyword)) {
          foundKeywords.push(keyword)
        }
      }
    })

    // Enhanced phrase detection  
    pattern.phrases.forEach(phrase => {
      if (content.includes(phrase.toLowerCase())) {
        phraseScore += 25
        foundPhrases.push(phrase)
      }
    })

    const totalScore = keywordScore + phraseScore
    
    // Must have some relevance
    if (totalScore === 0) return null

    // Calculate confidence with better logic
    const maxPossibleScore = (pattern.keywords.length * 10) + (pattern.phrases.length * 25)
    let confidence = Math.round((totalScore / maxPossibleScore) * 100)
    
    // Boost confidence based on category weight
    confidence = Math.min(95, confidence * pattern.confidenceWeight)
    
    // Must meet minimum confidence threshold
    if (confidence < 60) return null

    // Generate smart task content
    const { title, description } = this.generateSmartTaskContent(
      category, 
      contextSubject, 
      foundKeywords, 
      foundPhrases
    )
    
    return {
      id: `suggestion-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      type: pattern.type,
      priority: this.calculateSmartPriority(category, foundKeywords, content),
      estimatedTime: pattern.estimatedTime,
      confidence,
      reasoning: this.generateSmartReasoning(foundKeywords, foundPhrases, confidence),
      moduleId: this.findBestModuleMatch(content),
      taskTypeId: this.findBestTaskTypeMatch(pattern.type),
      devDeptId: this.findBestDepartmentMatch(content),
      tags: this.generateSmartTags(foundKeywords, contextSubject, category),
      category: category as TaskSuggestion['category']
    }
  }

  // Extract meaningful subject from content
  private extractContextSubject(content: string, noteTitle?: string): string {
    // Try to extract a meaningful subject from title first
    if (noteTitle && noteTitle.length > 3) {
      const cleanTitle = noteTitle.toLowerCase()
        .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, '')
        .trim()
      
      const words = cleanTitle.split(' ').filter(word => word.length > 2)
      if (words.length > 0) {
        return words[0] // Return the first meaningful word
      }
    }

    // Extract from content
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10)
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim()
      const words = firstSentence.split(' ')
        .filter(word => word.length > 3 && !/\b(the|and|that|this|will|need|should)\b/.test(word))
      
      if (words.length > 0) {
        return words[0].replace(/[^a-zA-Z]/g, '') // Clean the word
      }
    }

    return 'system' // Fallback
  }

  // Generate smart task content
  private generateSmartTaskContent(
    category: keyof typeof AI_PATTERNS,
    subject: string,
    keywords: string[],
    phrases: string[]
  ): { title: string; description: string } {
    
    const templates = SMART_TITLES[category]
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
    
    // Create meaningful title
    const title = randomTemplate.replace('{subject}', subject)
    
    // Create contextual description
    const descriptions = {
      bug_fix: `Investigate and resolve the ${subject} issue. Address the problem affecting system functionality and ensure proper testing.`,
      feature: `Develop and implement the ${subject} feature according to requirements. Create necessary components and integrate with existing system.`,
      testing: `Create comprehensive tests for ${subject} functionality. Include unit tests, integration tests, and validation scenarios.`,
      documentation: `Create detailed documentation for ${subject}. Include usage examples, API references, and user guides.`,
      meeting: `Organize and conduct ${subject} meeting with relevant stakeholders. Discuss requirements, progress, and next steps.`,
      research: `Research and analyze ${subject} options and solutions. Evaluate alternatives and provide recommendations.`,
      deployment: `Deploy ${subject} to production environment. Ensure proper testing, monitoring, and rollback procedures.`,
      maintenance: `Perform maintenance tasks for ${subject}. Update dependencies, optimize performance, and clean up code.`
    }

    return {
      title: title,
      description: descriptions[category]
    }
  }

  // Enhanced priority calculation
  private calculateSmartPriority(
    category: keyof typeof AI_PATTERNS,
    keywords: string[],
    content: string
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'production', 'live', 'broken']
    const highWords = ['important', 'priority', 'soon', 'deadline', 'breaking', 'issue', 'problem']
    
    let priorityScore = 0
    
    // Base score from category
    const basePriority = AI_PATTERNS[category].priority
    switch (basePriority) {
      case 'LOW': priorityScore = 1; break
      case 'MEDIUM': priorityScore = 2; break
      case 'HIGH': priorityScore = 3; break
      case 'URGENT': priorityScore = 4; break
    }

    // Check for urgency indicators
    urgentWords.forEach(word => {
      if (content.includes(word)) priorityScore += 2
    })
    
    highWords.forEach(word => {
      if (content.includes(word)) priorityScore += 1
    })

    // Convert score to priority
    if (priorityScore >= 6) return 'URGENT'
    if (priorityScore >= 4) return 'HIGH'
    if (priorityScore >= 2) return 'MEDIUM'
    return 'LOW'
  }

  // Generate smart reasoning
  private generateSmartReasoning(keywords: string[], phrases: string[], confidence: number): string {
    const keywordText = keywords.length > 0 ? keywords.slice(0, 3).join(', ') : 'general context'
    const phraseText = phrases.length > 0 ? phrases.length : 0
    
    return `Detected keywords: ${keywordText}. Found ${phraseText} relevant phrases. Analysis confidence: ${confidence}%`
  }

  // Generate smart tags
  private generateSmartTags(keywords: string[], subject: string, category: string): string[] {
    const tags = new Set<string>()
    
    // Add category
    tags.add(category.replace('_', '-'))
    
    // Add subject if meaningful
    if (subject && subject.length > 2 && subject !== 'system') {
      tags.add(subject.toLowerCase())
    }
    
    // Add relevant keywords (max 3)
    keywords.slice(0, 3).forEach(keyword => {
      if (keyword.length > 2) {
        tags.add(keyword.toLowerCase())
      }
    })
    
    return Array.from(tags).slice(0, 5) // Limit to 5 tags
  }

  // Find best matching module (same as before)
  private findBestModuleMatch(content: string): string | undefined {
    if (!this.lookups?.modules) return undefined
    
    const techMapping = {
      'react': 'Frontend',
      'api': 'Backend',
      'database': 'Database',
      'mobile': 'Mobile',
      'ui': 'Frontend'
    }

    for (const [tech, moduleName] of Object.entries(techMapping)) {
      if (content.includes(tech)) {
        const module = this.lookups.modules.find((m: any) => 
          m.name.toLowerCase().includes(moduleName.toLowerCase())
        )
        if (module) return module.id
      }
    }

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
      'frontend': ['frontend', 'ui', 'react', 'css', 'html', 'component'],
      'backend': ['backend', 'api', 'server', 'database', 'endpoint'],
      'qa': ['test', 'testing', 'quality', 'qa', 'validation'],
      'devops': ['deploy', 'deployment', 'docker', 'ci/cd', 'production']
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