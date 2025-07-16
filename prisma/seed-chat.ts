// prisma/seed-chat.ts - CREATE REAL DYNAMIC CHAT DATA
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDynamicChatSystem() {
  console.log('🚀 Creating dynamic chat system with real data...')

  try {
    // Get all existing users from your database
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true
      }
    })

    if (allUsers.length === 0) {
      console.log('❌ No users found. Please create users first.')
      return
    }

    console.log(`✅ Found ${allUsers.length} users to add to chat`)

    // Get admin users
    const adminUsers = allUsers.filter(user => user.role === 'ADMIN')
    const firstAdmin = adminUsers[0] || allUsers[0]

    console.log(`✅ Using admin: ${firstAdmin.email}`)

    // 1. Create dynamic chat rooms based on your actual data
    const roomsToCreate = [
      {
        name: 'General Discussion',
        description: 'Company-wide discussions and updates',
        type: 'GENERAL',
        isPrivate: false,
        allUsers: true // Add all users
      },
      {
        name: 'Announcements',
        description: 'Important company announcements',
        type: 'ANNOUNCEMENT', 
        isPrivate: false,
        allUsers: true,
        adminOnly: true // Only admins can post
      },
      {
        name: 'Tech Support',
        description: 'Technical questions and IT support',
        type: 'GENERAL',
        isPrivate: false,
        departments: ['IT', 'Development', 'Engineering']
      },
      {
        name: 'Random',
        description: 'Casual conversations and fun stuff',
        type: 'GENERAL',
        isPrivate: false,
        allUsers: true
      }
    ]

    // Create general rooms
    for (const roomData of roomsToCreate) {
      const existingRoom = await prisma.chatRoom.findFirst({
        where: { name: roomData.name }
      })

      if (existingRoom) {
        console.log(`⏭️ Room already exists: ${roomData.name}`)
        continue
      }

      // Create the room
      const room = await prisma.chatRoom.create({
        data: {
          name: roomData.name,
          description: roomData.description,
          type: roomData.type as any,
          isPrivate: roomData.isPrivate,
          createdBy: firstAdmin.id,
          memberCount: 0, // Will update after adding members
          messageCount: 0
        }
      })

      // Determine which users to add
      let usersToAdd = []
      
      if (roomData.allUsers) {
        usersToAdd = allUsers
      } else if (roomData.departments) {
        usersToAdd = allUsers.filter(user => 
          roomData.departments?.includes(user.department || '')
        )
      }

      // Add users to room
      for (const user of usersToAdd) {
        const role = roomData.adminOnly && user.role !== 'ADMIN' 
          ? 'MEMBER' 
          : user.role === 'ADMIN' 
          ? 'ADMIN' 
          : 'MEMBER'

        await prisma.chatRoomMember.create({
          data: {
            roomId: room.id,
            userId: user.id,
            role: role as any,
            isActive: true,
            unreadCount: 0
          }
        })
      }

      // Update member count
      await prisma.chatRoom.update({
        where: { id: room.id },
        data: { memberCount: usersToAdd.length }
      })

      // Create welcome message
      const welcomeMessage = await prisma.chatMessage.create({
        data: {
          content: roomData.type === 'ANNOUNCEMENT' 
            ? `📢 Welcome to ${room.name}! This channel is for important company announcements.`
            : `👋 Welcome to ${room.name}! Feel free to start chatting with your teammates.`,
          type: 'SYSTEM',
          roomId: room.id,
          senderId: firstAdmin.id,
          metadata: {
            isWelcomeMessage: true,
            systemMessageType: 'ROOM_CREATED'
          }
        }
      })

      // Update message count
      await prisma.chatRoom.update({
        where: { id: room.id },
        data: { 
          messageCount: 1,
          lastMessageAt: welcomeMessage.createdAt
        }
      })

      console.log(`✅ Created room: ${room.name} (${usersToAdd.length} members)`)
    }

    // 2. Create project-specific rooms from your existing projects
    const activeProjects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { 
          include: { 
            user: { select: { id: true, name: true, email: true, role: true } } 
          } 
        }
      }
    })

    console.log(`📁 Found ${activeProjects.length} active projects`)

    for (const project of activeProjects) {
      const existingProjectRoom = await prisma.chatRoom.findFirst({
        where: { 
          projectId: project.id,
          type: 'PROJECT'
        }
      })

      if (existingProjectRoom) {
        console.log(`⏭️ Project room already exists: ${project.name}`)
        continue
      }

      // Create project chat room
      const projectRoom = await prisma.chatRoom.create({
        data: {
          name: `${project.name} Team`,
          description: `Project discussions for ${project.name}`,
          type: 'PROJECT',
          projectId: project.id,
          isPrivate: true,
          createdBy: project.ownerId,
          memberCount: 0, // Will update after adding members
          messageCount: 0
        }
      })

      // Add project owner
      await prisma.chatRoomMember.create({
        data: {
          roomId: projectRoom.id,
          userId: project.ownerId,
          role: 'ADMIN',
          isActive: true,
          unreadCount: 0
        }
      })

      let memberCount = 1

      // Add project members
      for (const member of project.members) {
        // Skip if already added (owner)
        if (member.userId === project.ownerId) continue

        const role = member.role === 'MANAGER' ? 'MODERATOR' : 'MEMBER'

        await prisma.chatRoomMember.create({
          data: {
            roomId: projectRoom.id,
            userId: member.userId,
            role: role as any,
            isActive: true,
            unreadCount: 0
          }
        })

        memberCount++
      }

      // Update member count
      await prisma.chatRoom.update({
        where: { id: projectRoom.id },
        data: { memberCount }
      })

      // Create project welcome message
      const projectWelcomeMessage = await prisma.chatMessage.create({
        data: {
          content: `🚀 Welcome to the ${project.name} project chat! This is where our team collaborates and shares updates. Let's build something amazing together!`,
          type: 'SYSTEM',
          roomId: projectRoom.id,
          senderId: project.ownerId,
          metadata: {
            isWelcomeMessage: true,
            systemMessageType: 'PROJECT_ROOM_CREATED',
            projectId: project.id
          }
        }
      })

      // Update message count and timestamp
      await prisma.chatRoom.update({
        where: { id: projectRoom.id },
        data: { 
          messageCount: 1,
          lastMessageAt: projectWelcomeMessage.createdAt
        }
      })

      console.log(`✅ Created project room: ${projectRoom.name} (${memberCount} members)`)
    }

    // 3. Create some initial realistic messages for General Discussion
    const generalRoom = await prisma.chatRoom.findFirst({
      where: { name: 'General Discussion' }
    })

    if (generalRoom) {
      const sampleMessages = [
        {
          content: "Good morning everyone! 🌅 Hope you all have a productive day ahead!",
          senderId: firstAdmin.id,
          delay: 0
        },
        {
          content: "Thanks! Just finished reviewing the latest project updates. Great progress team! 👏",
          senderId: allUsers[1]?.id || firstAdmin.id,
          delay: 5 * 60 * 1000 // 5 minutes later
        },
        {
          content: "Quick reminder: Team standup meeting at 10 AM today. See you all there! 📅",
          senderId: firstAdmin.id,
          delay: 10 * 60 * 1000 // 10 minutes later
        }
      ]

      let messageCount = 1 // Already has welcome message

      for (const msgData of sampleMessages) {
        if (!msgData.senderId) continue

        const message = await prisma.chatMessage.create({
          data: {
            content: msgData.content,
            type: 'TEXT',
            roomId: generalRoom.id,
            senderId: msgData.senderId,
            createdAt: new Date(Date.now() - (30 * 60 * 1000) + msgData.delay) // 30 minutes ago + delay
          }
        })

        messageCount++
      }

      // Update general room stats
      await prisma.chatRoom.update({
        where: { id: generalRoom.id },
        data: { 
          messageCount,
          lastMessageAt: new Date()
        }
      })

      console.log(`✅ Added ${sampleMessages.length} sample messages to General Discussion`)
    }

    // 4. Update all users to be online initially
    await prisma.user.updateMany({
      where: { isActive: true },
      data: {
        isOnline: false, // They'll go online when they connect
        lastSeen: new Date()
      }
    })

    // Final summary
    const finalStats = {
      rooms: await prisma.chatRoom.count(),
      members: await prisma.chatRoomMember.count(),
      messages: await prisma.chatMessage.count(),
      users: allUsers.length
    }

    console.log('\n🎉 Dynamic chat system created successfully!')
    console.log('\n📊 Final Statistics:')
    console.log(`   👥 Users: ${finalStats.users}`)
    console.log(`   🏠 Rooms: ${finalStats.rooms}`)
    console.log(`   👤 Memberships: ${finalStats.members}`)
    console.log(`   💬 Messages: ${finalStats.messages}`)
    console.log('\n✅ All data is now 100% dynamic from your database!')
    console.log('🚀 Users can start chatting in real-time!\n')

  } catch (error) {
    console.error('❌ Error creating dynamic chat system:', error)
    throw error
  }
}

// Run the dynamic seed
async function main() {
  try {
    await seedDynamicChatSystem()
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()