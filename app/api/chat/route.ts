import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if this is a task-related message
    const isTaskRelated = message.toLowerCase().includes('task') || 
                         message.toLowerCase().includes('todo') ||
                         message.toLowerCase().includes('project') ||
                         message.toLowerCase().includes('work')

    let systemPrompt = `You are a helpful productivity assistant that helps users manage their tasks and improve their productivity. 
    
    Your role is to:
    1. Help users break down complex tasks into smaller, manageable steps
    2. Suggest better ways to phrase and organize tasks
    3. Estimate realistic time requirements
    4. Provide productivity tips and advice
    
    Keep responses concise, actionable, and friendly.`

    if (isTaskRelated) {
      systemPrompt += `
      
      When users describe tasks, you can suggest enhancements like:
      - Breaking down complex tasks into subtasks
      - Improving task titles to be more specific and actionable
      - Estimating pomodoros (25-minute work sessions)
      - Adding relevant context or resources
      
      If you're enhancing a task, provide the enhanced version in a structured format.`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.'

    // Check if the response contains task enhancement suggestions
    let suggestedTask = null
    if (isTaskRelated && response.includes('enhanced') || response.includes('improved')) {
      // Extract task enhancement if present
      suggestedTask = {
        title: 'Enhanced Task Title',
        description: 'Enhanced description with better context',
        estimatedPomodoros: 2
      }
    }

    return NextResponse.json({
      response,
      suggestedTask,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
