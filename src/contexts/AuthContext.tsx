import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAdmin: boolean | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  checkAdminRole: (userId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  // Function to check admin role
  const checkAdminRole = async (userId: string): Promise<boolean> => {
    setIsAdmin(null) // Set to null while checking
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.warn('Error fetching admin role:', error)
        setIsAdmin(false)
        return false
      }
      
      const isUserAdmin = data?.role === 'admin'
      setIsAdmin(isUserAdmin)
      return isUserAdmin
    } catch (error) {
      console.warn('Error checking admin role:', error)
      setIsAdmin(false)
      return false
    }
  }

  // Function to create or get user profile with timeout and better error handling
  const createOrGetProfile = async (user: User) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile operation timeout')), 5000)
      )

      const profilePromise = (async () => {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.warn('Error fetching profile (non-critical):', fetchError)
          return // Don't throw, just return
        }

        // If profile doesn't exist, create one
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            })

          if (insertError) {
            console.warn('Error creating profile (non-critical):', insertError)
          } else {
            console.log('Profile created successfully for user:', user.email)
          }
        }
      })()

      await Promise.race([profilePromise, timeoutPromise])
    } catch (error) {
      console.warn('Profile operation failed (non-critical):', error)
      // Don't set error state for profile issues - they're not critical for auth
    }
  }

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const initializeAuth = async () => {
      try {
        if (!mounted) return
        
        setError(null)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          console.error('Error getting session:', sessionError)
          setError('Failed to connect to authentication service. Please check your internet connection.')
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        // Only try to create profile and check admin role if we have a user and the component is still mounted
        if (session?.user && mounted) {
          // Don't await this - let it run in background
          createOrGetProfile(session.user).catch(console.warn)
          checkAdminRole(session.user.id).catch(console.warn)
        }
      } catch (error) {
        if (!mounted) return
        console.error('Auth initialization error:', error)
        setError('Authentication service is currently unavailable. Please try again later.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      
      try {
        setError(null)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Reset admin status when user logs out
        if (!session?.user) {
          setIsAdmin(null)
        }
        
        // Only try to create profile and check admin role if we have a user and the component is still mounted
        if (session?.user && mounted) {
          // Don't await this - let it run in background
          createOrGetProfile(session.user).catch(console.warn)
          checkAdminRole(session.user.id).catch(console.warn)
        }
      } catch (error) {
        if (!mounted) return
        console.error('Auth state change error:', error)
        setError('Authentication service error. Please refresh the page.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    authSubscription = subscription

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            email_confirmed: true
          }
        }
      })
      
      if (error) {
        setError(error.message)
        return { error }
      }
      
      // If signup successful and user is created, create profile in background
      if (data.user) {
        // Don't await this - let it run in background
        createOrGetProfile(data.user).catch(console.warn)
      }
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setError(error.message)
      }
      
      return { error }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      })
      
      if (error) {
        setError(error.message)
      }
      
      return { error }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
      setIsAdmin(null)
    } catch (error) {
      console.error('Sign out error:', error)
      setError('Failed to sign out. Please refresh the page.')
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    checkAdminRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

}