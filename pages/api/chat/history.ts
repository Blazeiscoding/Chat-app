
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/src/lib/prisma'
import type { HistoryResponse, Message } from '@/src/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryResponse>
) {

  if (req.method !== 'GET') {
    return res.status(405).json({
      messages: [],
      sessionId: '',
      error: 'Method not allowed',
    })
  }

  try {
    const { sessionId } = req.query


    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        messages: [],
        sessionId: '',
        error: 'Session ID is required',
      })
    }


    const conversation = await prisma.conversation.findUnique({
      where: { id: sessionId },
    })

    if (!conversation) {
      return res.status(404).json({
        messages: [],
        sessionId,
        error: 'Conversation not found',
      })
    }


    const dbMessages = await prisma.message.findMany({
      where: { conversationId: sessionId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        sender: true,
        text: true,
        createdAt: true,
      },
    })


    const messages: Message[] = dbMessages.map((msg) => ({
      id: msg.id,
      sender: msg.sender as 'user' | 'ai',
      text: msg.text,
      createdAt: msg.createdAt,
    }))

    return res.status(200).json({
      messages,
      sessionId,
    })

  } catch (error) {
    console.error('History API error:', error)
    
    return res.status(500).json({
      messages: [],
      sessionId: '',
      error: 'An unexpected error occurred.',
    })
  }
}
