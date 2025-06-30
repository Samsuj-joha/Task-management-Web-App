// // // src/app/dashboard/settings/page.tsx
// // 'use client'

// // import { useState, useRef, useEffect } from 'react'
// // import { useSession } from 'next-auth/react'
// // import { useProfile } from '@/contexts/profile-context'
// // import { Button } from '@/components/ui/button'
// // import { Input } from '@/components/ui/input'
// // import { Label } from '@/components/ui/label'
// // import { Textarea } from '@/components/ui/textarea'
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// // import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// // import { Badge } from '@/components/ui/badge'
// // import { Separator } from '@/components/ui/separator'
// // import { Alert, AlertDescription } from '@/components/ui/alert'
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// // import {
// //   User,
// //   Mail,
// //   Lock,
// //   Camera,
// //   Save,
// //   Loader2,
// //   Eye,
// //   EyeOff,
// //   Shield,
// //   Building2,
// //   Phone,
// //   MapPin,
// //   Calendar,
// //   Settings as SettingsIcon,
// //   Bell,
// //   Palette,
// //   Monitor,
// //   CheckCircle2,
// //   AlertCircle,
// //   X,
// //   Database,
// //   RefreshCw,
// //   Sun,
// //   Moon
// // } from 'lucide-react'
// // import { toast } from 'sonner'

// // export default function SettingsPage() {
// //   const { data: session } = useSession()
// //   const { 
// //     profile, 
// //     updateProfile, 
// //     saveProfileToDatabase, 
// //     loadProfileFromDatabase,
// //     isLoading: profileLoading 
// //   } = useProfile()
  
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [showNewPassword, setShowNewPassword] = useState(false)
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
// //   const fileInputRef = useRef<HTMLInputElement>(null)

// //   // Use profile context data instead of local state
// //   const [profileData, setProfileData] = useState(profile)

// //   // Sync with profile context when it changes
// //   useEffect(() => {
// //     setProfileData(profile)
// //   }, [profile])

// //   // Password form state - always empty initially
// //   const [passwordData, setPasswordData] = useState({
// //     currentPassword: '',
// //     newPassword: '',
// //     confirmPassword: ''
// //   })

// //   // Preferences state - all false/neutral by default
// //   const [preferences, setPreferences] = useState({
// //     emailNotifications: false,
// //     pushNotifications: false,
// //     weeklyReports: false,
// //     taskReminders: false,
// //     theme: 'system',
// //     language: '',
// //     timezone: ''
// //   })

// //   const departments = [
// //     'Information Technology',
// //     'Human Resources',
// //     'Sales & Marketing',
// //     'Operations',
// //     'Finance & Accounting',
// //     'Management',
// //     'Customer Service',
// //     'Research & Development',
// //     'Legal',
// //     'Administration'
// //   ]

// //   const languages = [
// //     { value: 'en', label: 'English' },
// //     { value: 'es', label: 'Español' },
// //     { value: 'fr', label: 'Français' },
// //     { value: 'de', label: 'Deutsch' },
// //     { value: 'zh', label: '中文' },
// //     { value: 'ja', label: '日本語' }
// //   ]

// //   const timezones = [
// //     { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
// //     { value: 'EST', label: 'EST (Eastern Standard Time)' },
// //     { value: 'PST', label: 'PST (Pacific Standard Time)' },
// //     { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
// //     { value: 'CET', label: 'CET (Central European Time)' },
// //     { value: 'JST', label: 'JST (Japan Standard Time)' }
// //   ]

// //   const getInitials = (firstName: string, lastName: string) => {
// //     if (!firstName && !lastName) return '??'
// //     return `${firstName.charAt(0) || '?'}${lastName.charAt(0) || '?'}`.toUpperCase()
// //   }

// //   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = event.target.files?.[0]
// //     if (file) {
// //       // Validate file size (max 2MB)
// //       if (file.size > 2 * 1024 * 1024) {
// //         toast.error('File too large', {
// //           description: 'Please select an image smaller than 2MB.'
// //         })
// //         return
// //       }

// //       // Validate file type
// //       if (!file.type.startsWith('image/')) {
// //         toast.error('Invalid file type', {
// //           description: 'Please select a valid image file (JPG, PNG, etc.).'
// //         })
// //         return
// //       }

// //       // Create preview URL
// //       const reader = new FileReader()
// //       reader.onload = (e) => {
// //         const imageData = e.target?.result as string
// //         setProfileData(prev => ({
// //           ...prev,
// //           image: imageData
// //         }))
        
// //         toast.success('Profile image selected!', {
// //           description: 'Remember to save your changes to update your profile.'
// //         })
// //       }
// //       reader.readAsDataURL(file)
// //     }
// //   }

// //   const handleRemoveImage = () => {
// //     setProfileData(prev => ({
// //       ...prev,
// //       image: ''
// //     }))
    
// //     // Clear file input
// //     if (fileInputRef.current) {
// //       fileInputRef.current.value = ''
// //     }
    
// //     toast.success('Profile image removed', {
// //       description: 'Remember to save your changes.'
// //     })
// //   }

// //   const handleRefreshProfile = async () => {
// //     setIsLoading(true)
// //     try {
// //       await loadProfileFromDatabase()
// //       toast.success('Profile refreshed from database! 🔄', {
// //         description: 'Your profile has been reloaded from the database.'
// //       })
// //     } catch (error) {
// //       toast.error('Failed to refresh profile', {
// //         description: 'Could not load profile from database.'
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handleProfileSave = async () => {
// //     // Validate required fields
// //     if (!profileData.firstName.trim()) {
// //       toast.error('First name is required')
// //       return
// //     }
    
// //     if (!profileData.lastName.trim()) {
// //       toast.error('Last name is required')
// //       return
// //     }
    
// //     if (!profileData.email.trim()) {
// //       toast.error('Email is required')
// //       return
// //     }

// //     setIsLoading(true)
// //     try {
// //       // Save to database
// //       const success = await saveProfileToDatabase(profileData)
      
// //       if (success) {
// //         toast.success('Profile saved to database! ✅', {
// //           description: 'Your profile has been updated successfully. Changes will appear in the header immediately!'
// //         })
// //       } else {
// //         // Fallback to local update if database save fails
// //         updateProfile(profileData)
// //         toast.warning('Profile saved locally ⚠️', {
// //           description: 'Could not save to database, but changes are saved locally.'
// //         })
// //       }
// //     } catch (error) {
// //       console.error('Profile save error:', error)
// //       // Fallback to local update
// //       updateProfile(profileData)
// //       toast.error('Database save failed, saved locally', {
// //         description: 'Your changes are saved locally but could not sync with database.'
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handlePasswordChange = async () => {
// //     if (passwordData.newPassword !== passwordData.confirmPassword) {
// //       toast.error('Passwords do not match')
// //       return
// //     }

// //     if (passwordData.newPassword.length < 8) {
// //       toast.error('Password must be at least 8 characters')
// //       return
// //     }

// //     setIsLoading(true)
// //     try {
// //       // TODO: Implement password change API
// //       await new Promise(resolve => setTimeout(resolve, 1000))
      
// //       setPasswordData({
// //         currentPassword: '',
// //         newPassword: '',
// //         confirmPassword: ''
// //       })
      
// //       toast.success('Password updated successfully! 🔒', {
// //         description: 'Your password has been changed.'
// //       })
// //     } catch (error) {
// //       toast.error('Failed to update password')
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handlePreferencesSave = async () => {
// //     setIsLoading(true)
// //     try {
// //       // TODO: Implement preferences save API
// //       await new Promise(resolve => setTimeout(resolve, 1000))
      
// //       toast.success('Preferences saved! ⚙️', {
// //         description: 'Your settings have been updated.'
// //       })
// //     } catch (error) {
// //       toast.error('Failed to save preferences')
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex items-center justify-between">
// //         <div className="flex items-center space-x-4">
// //           <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
// //             <SettingsIcon className="h-6 w-6 text-primary-foreground" />
// //           </div>
// //           <div>
// //             <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
// //             <p className="text-muted-foreground">
// //               Manage your account settings and preferences
// //             </p>
// //           </div>
// //         </div>

// //         {/* Database Status */}
// //         <div className="flex items-center space-x-2">
// //           <Button
// //             variant="outline"
// //             size="sm"
// //             onClick={handleRefreshProfile}
// //             disabled={isLoading || profileLoading}
// //           >
// //             {isLoading || profileLoading ? (
// //               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //             ) : (
// //               <RefreshCw className="h-4 w-4 mr-2" />
// //             )}
// //             Refresh from DB
// //           </Button>
          
// //           <Badge variant="outline" className="text-green-600">
// //             <Database className="h-3 w-3 mr-1" />
// //             Database Connected
// //           </Badge>
// //         </div>
// //       </div>

// //       <Tabs defaultValue="profile" className="space-y-6">
// //         <TabsList className="grid w-full grid-cols-3">
// //           <TabsTrigger value="profile">Profile</TabsTrigger>
// //           <TabsTrigger value="security">Security</TabsTrigger>
// //           <TabsTrigger value="preferences">Preferences</TabsTrigger>
// //         </TabsList>

// //         {/* Profile Tab */}
// //         <TabsContent value="profile" className="space-y-6">
// //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //             {/* Profile Picture */}
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Profile Picture</CardTitle>
// //                 <CardDescription>
// //                   Upload a new profile picture for your account
// //                 </CardDescription>
// //               </CardHeader>
// //               <CardContent className="text-center space-y-4">
// //                 {profileData.image ? (
// //                   <Avatar className="h-32 w-32 mx-auto">
// //                     <AvatarImage src={profileData.image} alt="Profile" />
// //                     <AvatarFallback className="text-2xl">
// //                       {getInitials(profileData.firstName, profileData.lastName)}
// //                     </AvatarFallback>
// //                   </Avatar>
// //                 ) : (
// //                   <Avatar className="h-32 w-32 mx-auto">
// //                     <AvatarFallback className="text-2xl bg-muted">
// //                       {getInitials(profileData.firstName, profileData.lastName)}
// //                     </AvatarFallback>
// //                   </Avatar>
// //                 )}
                
// //                 <div className="space-y-2">
// //                   <div className="flex gap-2">
// //                     <Button
// //                       variant="outline"
// //                       onClick={() => fileInputRef.current?.click()}
// //                       className="flex-1"
// //                       disabled={isLoading}
// //                     >
// //                       <Camera className="mr-2 h-4 w-4" />
// //                       {profileData.image ? 'Change Image' : 'Upload Image'}
// //                     </Button>
                    
// //                     {profileData.image && (
// //                       <Button
// //                         variant="outline"
// //                         onClick={handleRemoveImage}
// //                         className="px-3"
// //                         disabled={isLoading}
// //                       >
// //                         <X className="h-4 w-4" />
// //                       </Button>
// //                     )}
// //                   </div>
                  
// //                   <input
// //                     ref={fileInputRef}
// //                     type="file"
// //                     accept="image/*"
// //                     onChange={handleImageUpload}
// //                     className="hidden"
// //                   />
// //                   <p className="text-xs text-muted-foreground">
// //                     JPG, PNG up to 2MB • Saved to database
// //                   </p>
// //                 </div>
// //               </CardContent>
// //             </Card>

// //             {/* Profile Information */}
// //             <div className="lg:col-span-2 space-y-6">
// //               <Card>
// //                 <CardHeader>
// //                   <CardTitle className="flex items-center gap-2">
// //                     Personal Information
// //                     {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
// //                   </CardTitle>
// //                   <CardDescription>
// //                     Update your personal details and contact information (saved to PostgreSQL database)
// //                   </CardDescription>
// //                 </CardHeader>
// //                 <CardContent className="space-y-4">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div className="space-y-2">
// //                       <Label htmlFor="firstName">First Name *</Label>
// //                       <div className="relative">
// //                         <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                         <Input
// //                           id="firstName"
// //                           placeholder="Enter first name"
// //                           className="pl-10"
// //                           value={profileData.firstName}
// //                           onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
// //                           disabled={isLoading}
// //                         />
// //                       </div>
// //                     </div>

// //                     <div className="space-y-2">
// //                       <Label htmlFor="lastName">Last Name *</Label>
// //                       <Input
// //                         id="lastName"
// //                         placeholder="Enter last name"
// //                         value={profileData.lastName}
// //                         onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
// //                         disabled={isLoading}
// //                       />
// //                     </div>
// //                   </div>

// //                   <div className="space-y-2">
// //                     <Label htmlFor="email">Email Address *</Label>
// //                     <div className="relative">
// //                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                       <Input
// //                         id="email"
// //                         type="email"
// //                         placeholder="Enter email address"
// //                         className="pl-10"
// //                         value={profileData.email}
// //                         onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
// //                         disabled={isLoading}
// //                       />
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div className="space-y-2">
// //                       <Label htmlFor="department">Department</Label>
// //                       <Select
// //                         value={profileData.department}
// //                         onValueChange={(value) => setProfileData(prev => ({ ...prev, department: value }))}
// //                         disabled={isLoading}
// //                       >
// //                         <SelectTrigger>
// //                           <SelectValue placeholder="Select department" />
// //                         </SelectTrigger>
// //                         <SelectContent>
// //                           {departments.map((dept) => (
// //                             <SelectItem key={dept} value={dept}>
// //                               {dept}
// //                             </SelectItem>
// //                           ))}
// //                         </SelectContent>
// //                       </Select>
// //                     </div>

// //                     <div className="space-y-2">
// //                       <Label htmlFor="employeeId">Employee ID</Label>
// //                       <div className="relative">
// //                         <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                         <Input
// //                           id="employeeId"
// //                           placeholder="PG-12345"
// //                           className="pl-10"
// //                           value={profileData.employeeId}
// //                           onChange={(e) => setProfileData(prev => ({ ...prev, employeeId: e.target.value }))}
// //                           disabled={isLoading}
// //                         />
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div className="space-y-2">
// //                       <Label htmlFor="phone">Phone Number</Label>
// //                       <div className="relative">
// //                         <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                         <Input
// //                           id="phone"
// //                           placeholder="+1 (555) 123-4567"
// //                           className="pl-10"
// //                           value={profileData.phone}
// //                           onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
// //                           disabled={isLoading}
// //                         />
// //                       </div>
// //                     </div>

// //                     <div className="space-y-2">
// //                       <Label htmlFor="location">Location</Label>
// //                       <div className="relative">
// //                         <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                         <Input
// //                           id="location"
// //                           placeholder="New York, NY"
// //                           className="pl-10"
// //                           value={profileData.location}
// //                           onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
// //                           disabled={isLoading}
// //                         />
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="space-y-2">
// //                     <Label htmlFor="bio">Bio</Label>
// //                     <Textarea
// //                       id="bio"
// //                       placeholder="Tell us about yourself..."
// //                       rows={3}
// //                       value={profileData.bio}
// //                       onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
// //                       disabled={isLoading}
// //                     />
// //                   </div>

// //                   {/* Database Status Alert */}
// //                   <Alert>
// //                     <Database className="h-4 w-4" />
// //                     <AlertDescription>
// //                       Your profile data is stored securely in the PostgreSQL database. Changes will be saved permanently and synced across all devices.
// //                     </AlertDescription>
// //                   </Alert>

// //                   <Button onClick={handleProfileSave} disabled={isLoading || profileLoading} className="w-full">
// //                     {isLoading ? (
// //                       <>
// //                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                         Saving to database...
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Save className="mr-2 h-4 w-4" />
// //                         Save Profile to Database
// //                       </>
// //                     )}
// //                   </Button>
                  
// //                   {session?.user && (
// //                     <div className="text-xs text-muted-foreground text-center mt-2">
// //                       💡 Changes are saved to PostgreSQL database and will appear in the header immediately
// //                     </div>
// //                   )}
// //                 </CardContent>
// //               </Card>
// //             </div>
// //           </div>
// //         </TabsContent>

// //         {/* Security Tab */}
// //         <TabsContent value="security" className="space-y-6">
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Change Password</CardTitle>
// //                 <CardDescription>
// //                   Update your password to keep your account secure
// //                 </CardDescription>
// //               </CardHeader>
// //               <CardContent className="space-y-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="currentPassword">Current Password</Label>
// //                   <div className="relative">
// //                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                     <Input
// //                       id="currentPassword"
// //                       type={showPassword ? 'text' : 'password'}
// //                       placeholder="Enter current password"
// //                       className="pl-10 pr-10"
// //                       value={passwordData.currentPassword}
// //                       onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
// //                       disabled={isLoading}
// //                     />
// //                     <Button
// //                       type="button"
// //                       variant="ghost"
// //                       size="icon"
// //                       className="absolute right-0 top-0 h-full px-3"
// //                       onClick={() => setShowPassword(!showPassword)}
// //                       disabled={isLoading}
// //                     >
// //                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
// //                     </Button>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-2">
// //                   <Label htmlFor="newPassword">New Password</Label>
// //                   <div className="relative">
// //                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                     <Input
// //                       id="newPassword"
// //                       type={showNewPassword ? 'text' : 'password'}
// //                       placeholder="Enter new password"
// //                       className="pl-10 pr-10"
// //                       value={passwordData.newPassword}
// //                       onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
// //                       disabled={isLoading}
// //                     />
// //                     <Button
// //                       type="button"
// //                       variant="ghost"
// //                       size="icon"
// //                       className="absolute right-0 top-0 h-full px-3"
// //                       onClick={() => setShowNewPassword(!showNewPassword)}
// //                       disabled={isLoading}
// //                     >
// //                       {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
// //                     </Button>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-2">
// //                   <Label htmlFor="confirmPassword">Confirm New Password</Label>
// //                   <div className="relative">
// //                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
// //                     <Input
// //                       id="confirmPassword"
// //                       type={showConfirmPassword ? 'text' : 'password'}
// //                       placeholder="Confirm new password"
// //                       className="pl-10 pr-10"
// //                       value={passwordData.confirmPassword}
// //                       onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
// //                       disabled={isLoading}
// //                     />
// //                     <Button
// //                       type="button"
// //                       variant="ghost"
// //                       size="icon"
// //                       className="absolute right-0 top-0 h-full px-3"
// //                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// //                       disabled={isLoading}
// //                     >
// //                       {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
// //                     </Button>
// //                   </div>
// //                 </div>

// //                 {/* Password Requirements */}
// //                 <div className="text-xs text-muted-foreground space-y-1">
// //                   <p>Password must contain:</p>
// //                   <div className="space-y-1">
// //                     <div className="flex items-center space-x-2">
// //                       {passwordData.newPassword.length >= 8 ? (
// //                         <CheckCircle2 className="h-3 w-3 text-green-500" />
// //                       ) : (
// //                         <AlertCircle className="h-3 w-3 text-muted-foreground" />
// //                       )}
// //                       <span>At least 8 characters</span>
// //                     </div>
// //                     <div className="flex items-center space-x-2">
// //                       {/[A-Z]/.test(passwordData.newPassword) ? (
// //                         <CheckCircle2 className="h-3 w-3 text-green-500" />
// //                       ) : (
// //                         <AlertCircle className="h-3 w-3 text-muted-foreground" />
// //                       )}
// //                       <span>One uppercase letter</span>
// //                     </div>
// //                     <div className="flex items-center space-x-2">
// //                       {/[0-9]/.test(passwordData.newPassword) ? (
// //                         <CheckCircle2 className="h-3 w-3 text-green-500" />
// //                       ) : (
// //                         <AlertCircle className="h-3 w-3 text-muted-foreground" />
// //                       )}
// //                       <span>One number</span>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <Button onClick={handlePasswordChange} disabled={isLoading} className="w-full">
// //                   {isLoading ? (
// //                     <>
// //                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                       Updating...
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Shield className="mr-2 h-4 w-4" />
// //                       Update Password
// //                     </>
// //                   )}
// //                 </Button>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Security Information</CardTitle>
// //                 <CardDescription>
// //                   Your account security details
// //                 </CardDescription>
// //               </CardHeader>
// //               <CardContent className="space-y-4">
// //                 <div className="space-y-3">
// //                   <div className="flex items-center justify-between">
// //                     <span className="text-sm">Last login</span>
// //                     <span className="text-sm text-muted-foreground">
// //                       {session ? 'Current session' : 'Unknown'}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between">
// //                     <span className="text-sm">Database status</span>
// //                     <Badge variant="outline" className="text-green-600">
// //                       <Database className="h-3 w-3 mr-1" />
// //                       Connected
// //                     </Badge>
// //                   </div>
// //                   <div className="flex items-center justify-between">
// //                     <span className="text-sm">Password last changed</span>
// //                     <span className="text-sm text-muted-foreground">
// //                       {passwordData.newPassword ? 'Recently updated' : 'Not changed yet'}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between">
// //                     <span className="text-sm">Two-factor authentication</span>
// //                     <Badge variant="outline" className="text-orange-600">
// //                       Not configured
// //                     </Badge>
// //                   </div>
// //                   <div className="flex items-center justify-between">
// //                     <span className="text-sm">Profile completion</span>
// //                     <span className="text-sm text-muted-foreground">
// //                       {(() => {
// //                         const fields = [
// //                           profileData.firstName,
// //                           profileData.lastName,
// //                           profileData.email,
// //                           profileData.department,
// //                           profileData.employeeId
// //                         ]
// //                         const completed = fields.filter(Boolean).length
// //                         const percentage = Math.round((completed / fields.length) * 100)
// //                         return `${percentage}%`
// //                       })()}
// //                     </span>
// //                   </div>
// //                 </div>

// //                 <Separator />

// //                 <Alert>
// //                   <Shield className="h-4 w-4" />
// //                   <AlertDescription>
// //                     Your profile is securely stored in PostgreSQL database with encrypted authentication.
// //                   </AlertDescription>
// //                 </Alert>

// //                 <Button variant="outline" className="w-full" disabled>
// //                   <Shield className="mr-2 h-4 w-4" />
// //                   Enable 2FA (Coming Soon)
// //                 </Button>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </TabsContent>

// //         {/* Preferences Tab */}
// //         <TabsContent value="preferences" className="space-y-6">
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Notifications</CardTitle>
// //                 <CardDescription>
// //                   Choose what notifications you want to receive
// //                 </CardDescription>
// //               </CardHeader>
// //               <CardContent className="space-y-4">
// //                 <div className="space-y-4">
// //                   <div className="flex items-center justify-between">
// //                     <div className="space-y-0.5">
// //                       <div className="text-sm font-medium">Email Notifications</div>
// //                       <div className="text-xs text-muted-foreground">
// //                         Receive task updates via email
// //                       </div>
// //                     </div>
// //                     <Button
// //                       variant={preferences.emailNotifications ? "default" : "outline"}
// //                       size="sm"
// //                       onClick={() => setPreferences(prev => ({ 
// //                         ...prev, 
// //                         emailNotifications: !prev.emailNotifications 
// //                       }))}
// //                       disabled={isLoading}
// //                     >
// //                       {preferences.emailNotifications ? "On" : "Off"}
// //                     </Button>
// //                   </div>

// //                   <div className="flex items-center justify-between">
// //                     <div className="space-y-0.5">
// //                       <div className="text-sm font-medium">Push Notifications</div>
// //                       <div className="text-xs text-muted-foreground">
// //                         Receive browser notifications
// //                       </div>
// //                     </div>
// //                     <Button
// //                       variant={preferences.pushNotifications ? "default" : "outline"}
// //                       size="sm"
// //                       onClick={() => setPreferences(prev => ({ 
// //                         ...prev, 
// //                         pushNotifications: !prev.pushNotifications 
// //                       }))}
// //                       disabled={isLoading}
// //                     >
// //                       {preferences.pushNotifications ? "On" : "Off"}
// //                     </Button>
// //                   </div>

// //                   <div className="flex items-center justify-between">
// //                     <div className="space-y-0.5">
// //                       <div className="text-sm font-medium">Weekly Reports</div>
// //                       <div className="text-xs text-muted-foreground">
// //                         Get weekly productivity summaries
// //                       </div>
// //                     </div>
// //                     <Button
// //                       variant={preferences.weeklyReports ? "default" : "outline"}
// //                       size="sm"
// //                       onClick={() => setPreferences(prev => ({ 
// //                         ...prev, 
// //                         weeklyReports: !prev.weeklyReports 
// //                       }))}
// //                       disabled={isLoading}
// //                     >
// //                       {preferences.weeklyReports ? "On" : "Off"}
// //                     </Button>
// //                   </div>

// //                   <div className="flex items-center justify-between">
// //                     <div className="space-y-0.5">
// //                       <div className="text-sm font-medium">Task Reminders</div>
// //                       <div className="text-xs text-muted-foreground">
// //                         Get reminded about due tasks
// //                       </div>
// //                     </div>
// //                     <Button
// //                       variant={preferences.taskReminders ? "default" : "outline"}
// //                       size="sm"
// //                       onClick={() => setPreferences(prev => ({ 
// //                         ...prev, 
// //                         taskReminders: !prev.taskReminders 
// //                       }))}
// //                       disabled={isLoading}
// //                     >
// //                       {preferences.taskReminders ? "On" : "Off"}
// //                     </Button>
// //                   </div>
// //                 </div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Appearance & Localization</CardTitle>
// //                 <CardDescription>
// //                   Customize your interface preferences
// //                 </CardDescription>
// //               </CardHeader>
// //               <CardContent className="space-y-4">
// //                 <div className="space-y-2">
// //                   <Label>Theme</Label>
// //                   <Select
// //                     value={preferences.theme}
// //                     onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}
// //                     disabled={isLoading}
// //                   >
// //                     <SelectTrigger>
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="light">
// //                         <div className="flex items-center">
// //                           <Sun className="mr-2 h-4 w-4" />
// //                           Light
// //                         </div>
// //                       </SelectItem>
// //                       <SelectItem value="dark">
// //                         <div className="flex items-center">
// //                           <Moon className="mr-2 h-4 w-4" />
// //                           Dark
// //                         </div>
// //                       </SelectItem>
// //                       <SelectItem value="system">
// //                         <div className="flex items-center">
// //                           <Monitor className="mr-2 h-4 w-4" />
// //                           System
// //                         </div>
// //                       </SelectItem>
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <div className="space-y-2">
// //                   <Label>Language</Label>
// //                   <Select
// //                     value={preferences.language}
// //                     onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
// //                     disabled={isLoading}
// //                   >
// //                     <SelectTrigger>
// //                       <SelectValue placeholder="Select your language" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {languages.map((lang) => (
// //                         <SelectItem key={lang.value} value={lang.value}>
// //                           {lang.label}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <div className="space-y-2">
// //                   <Label>Timezone</Label>
// //                   <Select
// //                     value={preferences.timezone}
// //                     onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
// //                     disabled={isLoading}
// //                   >
// //                     <SelectTrigger>
// //                       <SelectValue placeholder="Select your timezone" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {timezones.map((tz) => (
// //                         <SelectItem key={tz.value} value={tz.value}>
// //                           {tz.label}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <Alert>
// //                   <Palette className="h-4 w-4" />
// //                   <AlertDescription>
// //                     Preferences will be saved to your database profile for sync across devices.
// //                   </AlertDescription>
// //                 </Alert>

// //                 <Button onClick={handlePreferencesSave} disabled={isLoading} className="w-full">
// //                   {isLoading ? (
// //                     <>
// //                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                       Saving...
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Save className="mr-2 h-4 w-4" />
// //                       Save Preferences
// //                     </>
// //                   )}
// //                 </Button>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   )
// // }




// // src/app/dashboard/settings/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
// import { ImageUpload } from '@/components/ui/image-upload'
// import { toast } from 'sonner'
// import { 
//   User, 
//   Mail, 
//   Phone, 
//   MapPin, 
//   Building2, 
//   Save, 
//   Loader2,
//   X,
//   Plus
// } from 'lucide-react'

// interface ProfileData {
//   id?: string
//   name?: string
//   firstName?: string
//   lastName?: string
//   email?: string
//   image?: string
//   role?: string
//   department?: string
//   employeeId?: string
//   phone?: string
//   location?: string
//   bio?: string
//   skills?: string[]
//   status?: string
//   isActive?: boolean
//   joinedAt?: string
//   lastActive?: string
//   createdAt?: string
//   updatedAt?: string
// }

// export default function SettingsPage() {
//   const { data: session, status } = useSession()
//   const [profile, setProfile] = useState<ProfileData | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSaving, setIsSaving] = useState(false)
//   const [newSkill, setNewSkill] = useState('')

//   // Form state
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     location: '',
//     bio: '',
//     department: '',
//     image: '',
//     skills: [] as string[]
//   })

//   // Fetch profile data
//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchProfile()
//     } else if (status !== 'loading') {
//       setIsLoading(false)
//     }
//   }, [session, status])

//   // Update form data when profile loads
//   useEffect(() => {
//     if (profile) {
//       setFormData({
//         firstName: profile.firstName || '',
//         lastName: profile.lastName || '',
//         email: profile.email || '',
//         phone: profile.phone || '',
//         location: profile.location || '',
//         bio: profile.bio || '',
//         department: profile.department || '',
//         image: profile.image || '',
//         skills: profile.skills || []
//       })
//     }
//   }, [profile])

//   const fetchProfile = async () => {
//     try {
//       setIsLoading(true)
//       const response = await fetch('/api/profile')
      
//       if (response.ok) {
//         const data = await response.json()
//         if (data.user) {
//           setProfile(data.user)
//         } else {
//           // Create fallback profile from session
//           const fallbackProfile: ProfileData = {
//             id: session?.user?.id || '',
//             firstName: session?.user?.name?.split(' ')[0] || '',
//             lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
//             name: session?.user?.name || '',
//             email: session?.user?.email || '',
//             image: session?.user?.image || '',
//             role: 'EMPLOYEE',
//             skills: []
//           }
//           setProfile(fallbackProfile)
//         }
//       } else {
//         console.warn('Failed to load profile')
//         toast.error('Failed to load profile')
//       }
//     } catch (error) {
//       console.error('Error loading profile:', error)
//       toast.error('Error loading profile')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const handleImageChange = async (imageUrl: string) => {
//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       image: imageUrl
//     }))

//     // Also immediately update the profile in the database
//     try {
//       const response = await fetch('/api/profile', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ image: imageUrl })
//       })

//       if (response.ok) {
//         const result = await response.json()
//         if (result.user) {
//           setProfile(result.user)
//         }
//       }
//     } catch (error) {
//       console.error('Error updating profile image:', error)
//     }
//   }

//   const addSkill = () => {
//     if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         skills: [...prev.skills, newSkill.trim()]
//       }))
//       setNewSkill('')
//     }
//   }

//   const removeSkill = (skillToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       skills: prev.skills.filter(skill => skill !== skillToRemove)
//     }))
//   }

//   const handleSave = async () => {
//     try {
//       setIsSaving(true)
      
//       const response = await fetch('/api/profile', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData)
//       })

//       if (response.ok) {
//         const result = await response.json()
//         if (result.user) {
//           setProfile(result.user)
//           toast.success('Profile updated successfully!')
//         } else {
//           throw new Error('No user data returned')
//         }
//       } else {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to update profile')
//       }
//     } catch (error) {
//       console.error('Update profile error:', error)
//       toast.error(error instanceof Error ? error.message : 'Failed to update profile')
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const getDisplayName = (): string => {
//     if (!profile) return session?.user?.name || 'User'
    
//     if (profile.firstName || profile.lastName) {
//       const firstName = profile.firstName || ''
//       const lastName = profile.lastName || ''
//       return `${firstName} ${lastName}`.trim() || 'User'
//     }
    
//     return profile.name || session?.user?.name || 'User'
//   }

//   const getInitials = (): string => {
//     const name = getDisplayName()
//     if (!name || name === 'User') return '??'
    
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   // Show loading state
//   if (status === 'loading' || isLoading) {
//     return (
//       <div className="container mx-auto py-6">
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
//             <p className="text-muted-foreground">Loading profile settings...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Show sign in prompt if not authenticated
//   if (!session) {
//     return (
//       <div className="container mx-auto py-6">
//         <div className="text-center">
//           <p className="text-muted-foreground">Please sign in to view settings.</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Settings</h1>
//           <p className="text-muted-foreground">
//             Manage your account settings and preferences
//           </p>
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-3">
//         {/* Profile Overview Card */}
//         <Card className="md:col-span-1">
//           <CardHeader className="text-center pb-4">
//             <ImageUpload
//               currentImage={formData.image}
//               displayName={getDisplayName()}
//               initials={getInitials()}
//               onImageChange={handleImageChange}
//               className="mx-auto"
//             />
//             <CardTitle className="mt-4">{getDisplayName()}</CardTitle>
//             <CardDescription>
//               {profile?.email || session?.user?.email}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {profile?.role && (
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Role</span>
//                 <Badge variant="secondary">{profile.role}</Badge>
//               </div>
//             )}
//             {profile?.department && (
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Department</span>
//                 <span className="text-sm font-medium">{profile.department}</span>
//               </div>
//             )}
//             {profile?.status && (
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Status</span>
//                 <Badge 
//                   variant={profile.status === 'ACTIVE' ? 'default' : 'secondary'}
//                 >
//                   {profile.status}
//                 </Badge>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Profile Form */}
//         <Card className="md:col-span-2">
//           <CardHeader>
//             <CardTitle>Profile Information</CardTitle>
//             <CardDescription>
//               Update your personal information and preferences
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Basic Information */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">First Name</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="firstName"
//                     value={formData.firstName}
//                     onChange={(e) => handleInputChange('firstName', e.target.value)}
//                     className="pl-10"
//                     placeholder="Enter first name"
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Last Name</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="lastName"
//                     value={formData.lastName}
//                     onChange={(e) => handleInputChange('lastName', e.target.value)}
//                     className="pl-10"
//                     placeholder="Enter last name"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   className="pl-10"
//                   placeholder="Enter email address"
//                 />
//               </div>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="phone"
//                     value={formData.phone}
//                     onChange={(e) => handleInputChange('phone', e.target.value)}
//                     className="pl-10"
//                     placeholder="Enter phone number"
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="location">Location</Label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="location"
//                     value={formData.location}
//                     onChange={(e) => handleInputChange('location', e.target.value)}
//                     className="pl-10"
//                     placeholder="Enter location"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="department">Department</Label>
//               <div className="relative">
//                 <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="department"
//                   value={formData.department}
//                   onChange={(e) => handleInputChange('department', e.target.value)}
//                   className="pl-10"
//                   placeholder="Enter department"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="bio">Bio</Label>
//               <Textarea
//                 id="bio"
//                 value={formData.bio}
//                 onChange={(e) => handleInputChange('bio', e.target.value)}
//                 placeholder="Tell us about yourself..."
//                 className="min-h-[100px]"
//               />
//             </div>

//             <Separator />

//             {/* Skills Section */}
//             <div className="space-y-4">
//               <div>
//                 <Label>Skills</Label>
//                 <p className="text-sm text-muted-foreground">
//                   Add skills that describe your expertise
//                 </p>
//               </div>
              
//               <div className="flex gap-2">
//                 <Input
//                   value={newSkill}
//                   onChange={(e) => setNewSkill(e.target.value)}
//                   placeholder="Add a skill..."
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') {
//                       e.preventDefault()
//                       addSkill()
//                     }
//                   }}
//                 />
//                 <Button 
//                   onClick={addSkill}
//                   size="icon"
//                   variant="outline"
//                   disabled={!newSkill.trim()}
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
              
//               {formData.skills.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                   {formData.skills.map((skill, index) => (
//                     <Badge key={index} variant="secondary" className="gap-1">
//                       {skill}
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
//                         onClick={() => removeSkill(skill)}
//                       >
//                         <X className="h-3 w-3" />
//                       </Button>
//                     </Badge>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <Separator />

//             {/* Save Button */}
//             <div className="flex justify-end">
//               <Button 
//                 onClick={handleSave}
//                 disabled={isSaving}
//                 className="min-w-[120px]"
//               >
//                 {isSaving ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="mr-2 h-4 w-4" />
//                     Save Changes
//                   </>
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }



// src/app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Save, 
  Loader2,
  X,
  Plus
} from 'lucide-react'

interface ProfileData {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  role?: string
  department?: string
  employeeId?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  status?: string
  isActive?: boolean
  joinedAt?: string
  lastActive?: string
  createdAt?: string
  updatedAt?: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    department: '',
    image: '',
    skills: [] as string[]
  })

  // Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status])

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        department: profile.department || '',
        image: profile.image || '',
        skills: profile.skills || []
      })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setProfile(data.user)
        } else {
          // Create fallback profile from session
          const fallbackProfile: ProfileData = {
            id: session?.user?.id || '',
            firstName: session?.user?.name?.split(' ')[0] || '',
            lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            image: session?.user?.image || '',
            role: 'EMPLOYEE',
            skills: []
          }
          setProfile(fallbackProfile)
        }
      } else {
        console.warn('Failed to load profile')
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error loading profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = async (imageUrl: string) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }))

    // Also immediately update the profile in the database
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageUrl })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.user) {
          setProfile(result.user)
          
          // Dispatch custom event to notify other components (like Header)
          window.dispatchEvent(new CustomEvent('profileUpdated', { 
            detail: { user: result.user } 
          }))
          
          console.log('Profile image updated and event dispatched')
        }
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.user) {
          setProfile(result.user)
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('profileUpdated', { 
            detail: { user: result.user } 
          }))
          
          toast.success('Profile updated successfully!')
        } else {
          throw new Error('No user data returned')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const getDisplayName = (): string => {
    if (!profile) return session?.user?.name || 'User'
    
    if (profile.firstName || profile.lastName) {
      const firstName = profile.firstName || ''
      const lastName = profile.lastName || ''
      return `${firstName} ${lastName}`.trim() || 'User'
    }
    
    return profile.name || session?.user?.name || 'User'
  }

  const getInitials = (): string => {
    const name = getDisplayName()
    if (!name || name === 'User') return '??'
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile settings...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show sign in prompt if not authenticated
  if (!session) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-4">
            <ImageUpload
              currentImage={formData.image}
              displayName={getDisplayName()}
              initials={getInitials()}
              onImageChange={handleImageChange}
              className="mx-auto"
            />
            <CardTitle className="mt-4">{getDisplayName()}</CardTitle>
            <CardDescription>
              {profile?.email || session?.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.role && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="secondary">{profile.role}</Badge>
              </div>
            )}
            {profile?.department && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Department</span>
                <span className="text-sm font-medium">{profile.department}</span>
              </div>
            )}
            {profile?.status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={profile.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {profile.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-10"
                    placeholder="Enter first name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pl-10"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10"
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="pl-10"
                  placeholder="Enter department"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
              />
            </div>

            <Separator />

            {/* Skills Section */}
            <div className="space-y-4">
              <div>
                <Label>Skills</Label>
                <p className="text-sm text-muted-foreground">
                  Add skills that describe your expertise
                </p>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button 
                  onClick={addSkill}
                  size="icon"
                  variant="outline"
                  disabled={!newSkill.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}