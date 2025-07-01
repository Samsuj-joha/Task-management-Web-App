// src/components/admin/lookup-manager.tsx - BUTTON LAYOUT VERSION
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useLookups, type LookupItem } from '@/hooks/use-lookups'
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  Database,
  ArrowUp,
  ArrowDown,
  Loader2,
  Code,
  Building,
  List,
  Wrench,
  Link,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LookupManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface EditingItem extends LookupItem {
  isActive?: boolean
  sortOrder?: number
  isNew?: boolean
  isEditing?: boolean
  taskTypeId?: string  // For SubTask
}

type LookupType = 'modules' | 'departments' | 'taskTypes' | 'subTasks' | 'modifyOptions' | 'references'

export function LookupManager({ isOpen, onClose }: LookupManagerProps) {
  const { data: lookups, isLoading, refetch } = useLookups()
  const [activeTab, setActiveTab] = useState<LookupType>('modules')
  const [editingItems, setEditingItems] = useState<Record<LookupType, EditingItem[]>>({
    modules: [],
    departments: [],
    taskTypes: [],
    subTasks: [],
    modifyOptions: [],
    references: []
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize editing items when lookups data changes
  useEffect(() => {
    if (lookups) {
      setEditingItems({
        modules: lookups.modules.map((item, index) => ({ 
          ...item, 
          isActive: true, 
          sortOrder: index,
          isEditing: false,
          isNew: false
        })),
        departments: lookups.departments.map((item, index) => ({ 
          ...item, 
          isActive: true, 
          sortOrder: index,
          isEditing: false,
          isNew: false
        })),
        taskTypes: lookups.taskTypes.map((item, index) => ({ 
          ...item, 
          isActive: true, 
          sortOrder: index,
          isEditing: false,
          isNew: false
        })),
        subTasks: lookups.subTasks?.map((item, index) => ({ 
          ...item, 
          isActive: true, 
          sortOrder: index,
          isEditing: false,
          isNew: false
        })) || [],
        modifyOptions: lookups.modifyOptions.map((item, index) => ({ 
          ...item, 
          isActive: true, 
          sortOrder: index,
          isEditing: false,
          isNew: false
        })),
        references: lookups.references.map((item, index) => ({ 
          ...item, 
          isActive: true, 
          sortOrder: index,
          isEditing: false,
          isNew: false
        }))
      })
    }
  }, [lookups])

  const currentItems = editingItems[activeTab] || []

  const handleAddItem = () => {
    if (!newItemName.trim()) return

    const newItem: EditingItem = {
      id: `temp_${Date.now()}`,
      name: newItemName.trim(),
      isActive: true,
      sortOrder: currentItems.length,
      isNew: true,
      isEditing: false
    }

    setEditingItems(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newItem]
    }))

    setNewItemName('')
    setShowAddDialog(false)
    
    toast.success("Item Added", {
      description: `"${newItemName.trim()}" has been added. Click Save Changes to apply.`,
    })
  }

  const handleEditItem = (id: string, field: keyof EditingItem, value: any) => {
    setEditingItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleDeleteItem = (id: string) => {
    const item = currentItems.find(item => item.id === id)
    setEditingItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => item.id !== id)
    }))
    
    toast.error("Item Removed", {
      description: `"${item?.name}" has been removed. Click Save Changes to apply.`,
    })
  }

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    const items = [...currentItems]
    const index = items.findIndex(item => item.id === id)
    
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < items.length - 1)
    ) {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      const temp = items[index]
      items[index] = items[newIndex]
      items[newIndex] = temp
      
      // Update sort orders
      items.forEach((item, idx) => {
        item.sortOrder = idx
      })

      setEditingItems(prev => ({
        ...prev,
        [activeTab]: items
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const endpoint = `/api/admin/lookups/${activeTab}`
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItems),
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      // Refresh the lookup data
      await refetch()
      
      toast.success("Changes Saved!", {
        description: `${tabConfigs.find(t => t.key === activeTab)?.label} updated successfully.`,
      })
      
    } catch (error) {
      console.error('Failed to save changes:', error)
      toast.error("Error", {
        description: "Failed to save changes. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const tabConfigs = [
    { 
      key: 'modules' as const, 
      label: 'Modules', 
      icon: Code, 
      emoji: '🧩',
      description: 'Development modules and components',
      examples: 'Frontend, Backend, Mobile App, etc.'
    },
    { 
      key: 'departments' as const, 
      label: 'Departments', 
      icon: Building, 
      emoji: '🏢',
      description: 'Teams and departments',
      examples: 'Frontend Team, Backend Team, QA Team, etc.'
    },
    { 
      key: 'taskTypes' as const, 
      label: 'Task Types', 
      icon: List, 
      emoji: '📋',
      description: 'Types of tasks and work items',
      examples: 'Bug Fix, Feature Development, Testing, etc.'
    },
    { 
      key: 'subTasks' as const, 
      label: 'Sub Tasks', 
      icon: Layers, 
      emoji: '📝',
      description: 'Sub categories for task types',
      examples: 'Critical Bug, New Component, Code Review, etc.'
    },
    { 
      key: 'modifyOptions' as const, 
      label: 'Modify Options', 
      icon: Wrench, 
      emoji: '🔧',
      description: 'Modification and change options',
      examples: 'Add Feature, Update Existing, Remove, etc.'
    },
    { 
      key: 'references' as const, 
      label: 'References', 
      icon: Link, 
      emoji: '🔗',
      description: 'Reference sources and links',
      examples: 'GitHub Issue, Jira Ticket, Email, etc.'
    },
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[100vw] w-full max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Database className="h-7 w-7 text-primary" />
              <div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  Form Data Management
                </span>
                <Badge variant="secondary" className="ml-3">Admin Panel</Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-4rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Settings className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
                  <p className="text-lg text-muted-foreground">Loading form data...</p>
                  <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch all categories</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                {/* Button Layout for Categories */}
                <div className="space-y-3">
                  {/* First Row - 3 buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {tabConfigs.slice(0, 3).map((tab) => {
                      const isActive = activeTab === tab.key
                      const itemCount = editingItems[tab.key]?.filter(item => item.isActive).length || 0
                      
                      return (
                        <Button
                          key={tab.key}
                          variant={isActive ? "default" : "outline"}
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            "relative h-12 px-3 text-sm font-medium",
                            isActive && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          )}
                        >
                          {tab.label}
                          
                          {/* Notification Badge */}
                          <Badge 
                            variant={isActive ? "secondary" : "default"}
                            className={cn(
                              "absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold",
                              isActive ? "bg-white text-primary" : "bg-primary text-white"
                            )}
                          >
                            {itemCount}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                  
                  {/* Second Row - 3 buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {tabConfigs.slice(3, 6).map((tab) => {
                      const isActive = activeTab === tab.key
                      const itemCount = editingItems[tab.key]?.filter(item => item.isActive).length || 0
                      
                      return (
                        <Button
                          key={tab.key}
                          variant={isActive ? "default" : "outline"}
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            "relative h-12 px-3 text-sm font-medium",
                            isActive && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          )}
                        >
                          {tab.label}
                          
                          {/* Notification Badge */}
                          <Badge 
                            variant={isActive ? "secondary" : "default"}
                            className={cn(
                              "absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold",
                              isActive ? "bg-white text-primary" : "bg-primary text-white"
                            )}
                          >
                            {itemCount}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Active Tab Content */}
                {tabConfigs.map((tab) => {
                  if (activeTab !== tab.key) return null
                  
                  const IconComponent = tab.icon
                  return (
                    <Card key={tab.key} className="border-2">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                        <div className="flex flex-row items-center justify-between space-y-0">
                          <div className="space-y-2">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <IconComponent className="h-6 w-6 text-primary" />
                              <div>
                                {tab.label}
                                <Badge variant="outline" className="ml-3">
                                  {currentItems.filter(item => item.isActive).length} active
                                </Badge>
                              </div>
                            </CardTitle>
                            <CardDescription className="text-base">
                              {tab.description}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setShowAddDialog(true)}
                            size="lg"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Plus className="h-5 w-5" />
                            Add New {tab.label.slice(0, -1)}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="rounded-lg border-2 overflow-x-auto">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-20 font-semibold whitespace-nowrap">Order</TableHead>
                                <TableHead className="font-semibold min-w-[200px]">Name</TableHead>
                                <TableHead className="w-24 font-semibold whitespace-nowrap">Status</TableHead>
                                <TableHead className="w-32 font-semibold whitespace-nowrap">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentItems.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-4">
                                      <div className="relative">
                                        <Database className="h-16 w-16 text-muted-foreground/50" />
                                        <div className="absolute -top-2 -right-2">
                                          <span className="text-3xl">{tab.emoji}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-lg font-medium text-muted-foreground">
                                          No {tab.label.toLowerCase()} found
                                        </p>
                                        <p className="text-sm text-muted-foreground max-w-md">
                                          Click "Add New {tab.label.slice(0, -1)}" to create your first {tab.label.toLowerCase().slice(0, -1)} item. 
                                          This will appear in task form dropdowns.
                                        </p>
                                      </div>
                                      <Button 
                                        onClick={() => setShowAddDialog(true)}
                                        variant="outline"
                                        className="mt-2"
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Item
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                currentItems.map((item, index) => (
                                  <TableRow 
                                    key={item.id} 
                                    className={cn(
                                      "hover:bg-muted/30 transition-colors",
                                      !item.isActive && "opacity-60 bg-muted/20"
                                    )}
                                  >
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                          {index + 1}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-blue-100"
                                            onClick={() => handleMoveItem(item.id, 'up')}
                                            disabled={index === 0}
                                          >
                                            <ArrowUp className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-blue-100"
                                            onClick={() => handleMoveItem(item.id, 'down')}
                                            disabled={index === currentItems.length - 1}
                                          >
                                            <ArrowDown className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {item.isEditing ? (
                                        <Input
                                          value={item.name}
                                          onChange={(e) => handleEditItem(item.id, 'name', e.target.value)}
                                          onBlur={() => handleEditItem(item.id, 'isEditing', false)}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleEditItem(item.id, 'isEditing', false)
                                            }
                                          }}
                                          autoFocus
                                          className="h-8 border-2 border-primary/50"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-3">
                                          <span
                                            className={cn(
                                              "cursor-pointer font-medium text-base hover:text-primary transition-colors",
                                              !item.isActive && "text-muted-foreground line-through"
                                            )}
                                            onClick={() => handleEditItem(item.id, 'isEditing', true)}
                                          >
                                            {item.name}
                                          </span>
                                          {item.isNew && (
                                            <Badge variant="secondary" className="text-xs animate-pulse">
                                              New
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={item.isActive}
                                          onCheckedChange={(checked) => 
                                            handleEditItem(item.id, 'isActive', checked)
                                          }
                                        />
                                        <span className="text-xs text-muted-foreground">
                                          {item.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
                                          onClick={() => handleEditItem(item.id, 'isEditing', true)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 hover:bg-red-100 hover:text-red-700"
                                          onClick={() => handleDeleteItem(item.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Save Section */}
                <div className="flex flex-col justify-center sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t-2 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={onClose} disabled={isSaving} size="lg" className="flex-1 sm:flex-none">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2 flex-1 sm:flex-none"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save All Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">
                {tabConfigs.find(t => t.key === activeTab)?.emoji}
              </span>
              Add New {tabConfigs.find(t => t.key === activeTab)?.label.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              Enter a name for the new {tabConfigs.find(t => t.key === activeTab)?.label.toLowerCase().slice(0, -1)} item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newItemName" className="font-medium">Item Name</Label>
              <Input
                id="newItemName"
                placeholder={`Enter ${tabConfigs.find(t => t.key === activeTab)?.label.toLowerCase().slice(0, -1)} name...`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem()
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Example: {tabConfigs.find(t => t.key === activeTab)?.examples?.split(',')[0]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddItem} 
              disabled={!newItemName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}