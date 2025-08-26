# N8N Workflow Setup for Task Enhancement

This guide will help you set up N8N to automatically enhance tasks using AI when they are created in your Pomofocus Todo app.

## 🎯 **What This Workflow Does:**

1. **Triggers** when a new task is created in Supabase
2. **Calls your Next.js API** to enhance the task with AI
3. **Updates the task** in Supabase with enhanced information
4. **Sends notifications** (optional) about the enhancement

## 🚀 **Step 1: Install and Set Up N8N**

### Option A: Local Installation
```bash
npm install n8n -g
n8n start
```

### Option B: Docker Installation
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option C: Cloud Hosting
- [n8n.cloud](https://n8n.cloud) (official cloud service)
- [Railway](https://railway.app)
- [Render](https://render.com)

## 🔧 **Step 2: Create the Workflow**

### 1. **Supabase Trigger Node**
- **Node Type**: Supabase Trigger
- **Event**: `INSERT` on `tasks` table
- **Database URL**: Your Supabase project URL
- **API Key**: Your Supabase service role key (not anon key)

### 2. **HTTP Request Node (Task Enhancement)**
- **Node Type**: HTTP Request
- **Method**: POST
- **URL**: `https://your-app.vercel.app/api/enhance-task`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**: 
  ```json
  {
    "taskId": "{{$json.id}}",
    "title": "{{$json.title}}",
    "description": "{{$json.description}}",
    "userEmail": "{{$json.user_email}}"
  }
  ```

### 3. **Supabase Update Node (Optional)**
- **Node Type**: Supabase
- **Operation**: Update
- **Table**: `tasks`
- **Update Data**: 
  ```json
  {
    "enhanced_at": "{{$now}}",
    "enhancement_status": "completed"
  }
  ```

### 4. **Notification Node (Optional)**
- **Node Type**: Email/Slack/Discord
- **Message**: Task enhancement completed for: {{$json.title}}

## 📋 **Step 3: Environment Variables in N8N**

Add these environment variables in your N8N instance:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTJS_API_URL=https://your-app.vercel.app
```

## 🔐 **Step 4: Supabase Setup for N8N**

### 1. **Create Service Role Key**
- Go to Supabase Dashboard → Settings → API
- Copy the `service_role` key (not the anon key)
- This key has full access to your database

### 2. **Enable Database Webhooks (Alternative Method)**
If you prefer webhooks instead of polling:

```sql
-- Create a function to handle task creation
CREATE OR REPLACE FUNCTION handle_new_task()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called when a new task is inserted
  -- You can add custom logic here if needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER on_task_created
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_task();
```

## 🔄 **Step 5: Workflow Flow**

```
[Supabase Trigger] → [HTTP Request] → [Supabase Update] → [Notification]
     ↓                    ↓                ↓              ↓
  New Task          Call Your API     Update Task    Send Alert
  Created           Enhance Task      Status         (Optional)
```

## 🧪 **Step 6: Testing the Workflow**

1. **Activate the workflow** in N8N
2. **Create a new task** in your todo app
3. **Check N8N execution logs** to see the workflow run
4. **Verify the task** was enhanced in your app

## 🚨 **Troubleshooting**

### Common Issues:

1. **API Key Errors**
   - Ensure you're using the `service_role` key, not `anon` key
   - Check if the key has proper permissions

2. **CORS Issues**
   - Your Next.js API should handle CORS properly
   - N8N might need to be whitelisted

3. **Rate Limiting**
   - OpenAI has rate limits
   - Add delays between requests if needed

4. **Database Connection**
   - Verify Supabase connection in N8N
   - Check if your database is accessible

## 📊 **Monitoring and Analytics**

### N8N Dashboard:
- View workflow execution history
- Monitor success/failure rates
- Set up alerts for failures

### Supabase Dashboard:
- Check task enhancement status
- Monitor API usage
- View database logs

## 🔒 **Security Considerations**

1. **Use Service Role Key**: Never expose the service role key in client-side code
2. **API Rate Limiting**: Implement rate limiting in your Next.js API
3. **Input Validation**: Validate all inputs in your API endpoints
4. **Error Handling**: Don't expose sensitive information in error messages

## 🎉 **Next Steps**

Once your workflow is running:

1. **Add more enhancement types** (time estimation, priority suggestions)
2. **Implement user preferences** for enhancement styles
3. **Add analytics** to track enhancement effectiveness
4. **Create feedback loops** to improve AI suggestions

## 📚 **Additional Resources**

- [N8N Documentation](https://docs.n8n.io/)
- [Supabase Triggers](https://supabase.com/docs/guides/database/webhooks)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

---

**Need Help?** Check the N8N community forums or create an issue in your project repository!
