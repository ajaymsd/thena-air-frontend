import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing or invalid:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.error('📝 Please create a .env.local file in the frontend directory with your Supabase credentials')
  console.error('📖 See SUPABASE_SETUP.md for detailed instructions')
  
  // Show a user-friendly error in the browser
  if (typeof window !== 'undefined') {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fee2e2;
      color: #b91c1c;
      padding: 1rem;
      text-align: center;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    `
    errorDiv.innerHTML = `
      <strong>Configuration Error:</strong> Supabase credentials are missing. 
      Please check the console for setup instructions or see SUPABASE_SETUP.md
    `
    document.body.appendChild(errorDiv)
  }
}

// Create a fallback client if environment variables are missing
const createFallbackClient = () => {
  console.warn('🔄 Creating fallback Supabase client - authentication will not work')
  return createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)