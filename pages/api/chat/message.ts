
import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/src/lib/prisma'
import { generateReply, validateMessage } from '@/src/lib/llm'
import type { ChatResponse, Message } from '@/src/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      reply: '',
      sessionId: '',
      error: 'Method not allowed',
    })
  }

  try {
    const { message, sessionId } = req.body


    const validation = validateMessage(message)
    if (!validation.valid) {
      return res.status(400).json({
        reply: '',
        sessionId: sessionId || '',
        error: validation.error,
      })
    }

    const trimmedMessage = message.trim()
    let conversationId = sessionId


    if (!conversationId) {

      const conversation = await prisma.conversation.create({
        data: {
          metadata: {
            userAgent: req.headers['user-agent'] || 'unknown',
            createdAt: new Date().toISOString(),
          },
        },
      })
      conversationId = conversation.id
    } else {

      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
      
      if (!existing) {

        await prisma.conversation.create({
          data: {
            id: conversationId,
            metadata: {
              userAgent: req.headers['user-agent'] || 'unknown',
              createdAt: new Date().toISOString(),
            },
          },
        })
      }
    }


    await prisma.message.create({
      data: {
        id: uuidv4(),
        conversationId,
        sender: 'user',
        text: trimmedMessage,
      },
    })


    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        sender: true,
        text: true,
        createdAt: true,
      },
    })


    const historyMessages: Message[] = history.slice(0, -1).map((msg) => ({
      id: msg.id,
      sender: msg.sender as 'user' | 'ai',
      text: msg.text,
      createdAt: msg.createdAt,
    }))


    let aiReply: string
    try {
      aiReply = await generateReply(historyMessages, trimmedMessage)
    } catch (llmError) {

      const errorMessage = llmError instanceof Error 
        ? llmError.message 
        : 'Sorry, I encountered an error. Please try again.'
      
      await prisma.message.create({
        data: {
          id: uuidv4(),
          conversationId,
          sender: 'ai',
          text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      })

      return res.status(200).json({
        reply: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sessionId: conversationId,
        error: errorMessage,
      })
    }


    await prisma.message.create({
      data: {
        id: uuidv4(),
        conversationId,
        sender: 'ai',
        text: aiReply,
      },
    })


    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return res.status(200).json({
      reply: aiReply,
      sessionId: conversationId,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    return res.status(500).json({
      reply: '',
      sessionId: '',
      error: 'An unexpected error occurred. Please try again.',
    })
  }
}
