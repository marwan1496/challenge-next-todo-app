import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { taskId, title, description, userEmail } = await request.json()

    if (!taskId || !title || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, title, userEmail' },
        { status: 400 }
      )
    }

    // Create prompt for OpenAI to enhance the task
    const enhancementPrompt = `Please enhance this task to make it more actionable and clear:

Original Task: "${title}"
${description ? `Description: "${description}"` : ''}

Please provide:
1. An improved, more specific title
2. A better description with actionable steps
3. A realistic estimate of pomodoros (25-minute work sessions) needed
4. Any relevant context or resources

Format your response as JSON:
{
  "enhancedTitle": "Improved task title",
  "enhancedDescription": "Better description with steps",
  "estimatedPomodoros": 3,
  "reasoning": "Why these changes improve the task"
}

Keep the enhanced title concise but specific. Break down complex tasks into clear, actionable steps.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a productivity expert who helps improve task clarity and actionability. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: enhancementPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent formatting
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse the JSON response
    let enhancedTask
    try {
      enhancedTask = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse AI enhancement' },
        { status: 500 }
      )
    }

    // Update the task in Supabase with enhanced information
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        title: enhancedTask.enhancedTitle,
        description: enhancedTask.enhancedDescription,
        estimated_pomodoros: enhancedTask.estimatedPomodoros,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_email', userEmail)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update task in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enhancedTask: {
        id: taskId,
        title: enhancedTask.enhancedTitle,
        description: enhancedTask.enhancedDescription,
        estimatedPomodoros: enhancedTask.estimatedPomodoros,
        reasoning: enhancedTask.reasoning
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Task enhancement API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
