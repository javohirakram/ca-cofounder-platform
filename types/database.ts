export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          headline: string | null
          bio: string | null
          role: string[]
          skills: string[]
          industries: string[]
          country: string | null
          city: string | null
          languages: string[]
          commitment: string | null
          idea_stage: string | null
          equity_min: number | null
          equity_max: number | null
          linkedin_url: string | null
          telegram_handle: string | null
          telegram_id: number | null
          looking_for_roles: string[]
          looking_for_description: string | null
          education: Json
          experience: Json
          ecosystem_tags: string[]
          is_actively_looking: boolean
          is_admin: boolean
          profile_completeness: number
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          headline?: string | null
          bio?: string | null
          role?: string[]
          skills?: string[]
          industries?: string[]
          country?: string | null
          city?: string | null
          languages?: string[]
          commitment?: string | null
          idea_stage?: string | null
          equity_min?: number | null
          equity_max?: number | null
          linkedin_url?: string | null
          telegram_handle?: string | null
          telegram_id?: number | null
          looking_for_roles?: string[]
          looking_for_description?: string | null
          education?: Json
          experience?: Json
          ecosystem_tags?: string[]
          is_actively_looking?: boolean
          is_admin?: boolean
          profile_completeness?: number
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          headline?: string | null
          bio?: string | null
          role?: string[]
          skills?: string[]
          industries?: string[]
          country?: string | null
          city?: string | null
          languages?: string[]
          commitment?: string | null
          idea_stage?: string | null
          equity_min?: number | null
          equity_max?: number | null
          linkedin_url?: string | null
          telegram_handle?: string | null
          telegram_id?: number | null
          looking_for_roles?: string[]
          looking_for_description?: string | null
          education?: Json
          experience?: Json
          ecosystem_tags?: string[]
          is_actively_looking?: boolean
          is_admin?: boolean
          profile_completeness?: number
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          author_id: string
          title: string
          description: string | null
          problem: string | null
          solution: string | null
          stage: string | null
          industries: string[]
          country_focus: string[]
          looking_for_roles: string[]
          looking_for_description: string | null
          is_open: boolean
          upvotes: number
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          description?: string | null
          problem?: string | null
          solution?: string | null
          stage?: string | null
          industries?: string[]
          country_focus?: string[]
          looking_for_roles?: string[]
          looking_for_description?: string | null
          is_open?: boolean
          upvotes?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          description?: string | null
          problem?: string | null
          solution?: string | null
          stage?: string | null
          industries?: string[]
          country_focus?: string[]
          looking_for_roles?: string[]
          looking_for_description?: string | null
          is_open?: boolean
          upvotes?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      idea_upvotes: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user_a: string
          user_b: string
          score: number
          score_breakdown: Json
          status: string
          last_computed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_a: string
          user_b: string
          score?: number
          score_breakdown?: Json
          status?: string
          last_computed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_a?: string
          user_b?: string
          score?: number
          score_breakdown?: Json
          status?: string
          last_computed_at?: string
          created_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          recipient_id: string
          message: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          recipient_id: string
          message?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          recipient_id?: string
          message?: string | null
          status?: string
          created_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          participant_a: string
          participant_b: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          participant_a: string
          participant_b: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          participant_a?: string
          participant_b?: string
          last_message_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      idea_interests: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          message?: string | null
          created_at?: string
        }
      }
      accelerators: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          country: string | null
          city: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          country?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          country?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      accelerator_members: {
        Row: {
          id: string
          accelerator_id: string
          user_id: string
          cohort: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          accelerator_id: string
          user_id: string
          cohort?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          accelerator_id?: string
          user_id?: string
          cohort?: string | null
          role?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string | null
          body: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title?: string | null
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string | null
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Idea = Database['public']['Tables']['ideas']['Row']
export type IdeaInsert = Database['public']['Tables']['ideas']['Insert']
export type IdeaUpdate = Database['public']['Tables']['ideas']['Update']

export type IdeaUpvote = Database['public']['Tables']['idea_upvotes']['Row']
export type IdeaUpvoteInsert = Database['public']['Tables']['idea_upvotes']['Insert']
export type IdeaUpvoteUpdate = Database['public']['Tables']['idea_upvotes']['Update']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type Connection = Database['public']['Tables']['connections']['Row']
export type ConnectionInsert = Database['public']['Tables']['connections']['Insert']
export type ConnectionUpdate = Database['public']['Tables']['connections']['Update']

export type Thread = Database['public']['Tables']['threads']['Row']
export type ThreadInsert = Database['public']['Tables']['threads']['Insert']
export type ThreadUpdate = Database['public']['Tables']['threads']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type IdeaInterest = Database['public']['Tables']['idea_interests']['Row']
export type IdeaInterestInsert = Database['public']['Tables']['idea_interests']['Insert']
export type IdeaInterestUpdate = Database['public']['Tables']['idea_interests']['Update']

export type Accelerator = Database['public']['Tables']['accelerators']['Row']
export type AcceleratorInsert = Database['public']['Tables']['accelerators']['Insert']
export type AcceleratorUpdate = Database['public']['Tables']['accelerators']['Update']

export type AcceleratorMember = Database['public']['Tables']['accelerator_members']['Row']
export type AcceleratorMemberInsert = Database['public']['Tables']['accelerator_members']['Insert']
export type AcceleratorMemberUpdate = Database['public']['Tables']['accelerator_members']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
