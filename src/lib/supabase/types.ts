export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability_rules: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          schedule_id: string
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          schedule_id: string
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          schedule_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "availability_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_schedules: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_schedules_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          is_public: boolean
          profile_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          profile_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          profile_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_cents: number
          cancellation_reason: string | null
          coupon_id: string | null
          created_at: string
          currency: string
          end_time: string
          event_type_id: string
          id: string
          invitee_email: string
          invitee_name: string
          invitee_notes: string | null
          invitee_timezone: string
          is_paid: boolean
          package_purchase_id: string | null
          profile_id: string
          start_time: string
          status: string
          stripe_checkout_session_id: string | null
        }
        Insert: {
          amount_cents?: number
          cancellation_reason?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          end_time: string
          event_type_id: string
          id?: string
          invitee_email: string
          invitee_name: string
          invitee_notes?: string | null
          invitee_timezone?: string
          is_paid?: boolean
          package_purchase_id?: string | null
          profile_id: string
          start_time: string
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          cancellation_reason?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          end_time?: string
          event_type_id?: string
          id?: string
          invitee_email?: string
          invitee_name?: string
          invitee_notes?: string | null
          invitee_timezone?: string
          is_paid?: boolean
          package_purchase_id?: string | null
          profile_id?: string
          start_time?: string
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_purchase_id_fkey"
            columns: ["package_purchase_id"]
            isOneToOne: false
            referencedRelation: "package_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          external_account_email: string | null
          id: string
          is_primary: boolean
          profile_id: string
          provider: string
          refresh_token: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          external_account_email?: string | null
          id?: string
          is_primary?: boolean
          profile_id: string
          provider: string
          refresh_token?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          external_account_email?: string | null
          id?: string
          is_primary?: boolean
          profile_id?: string
          provider?: string
          refresh_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_connections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          incurred_on: string
          name: string
          notes: string | null
          recurrence: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          incurred_on?: string
          name: string
          notes?: string | null
          recurrence?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          incurred_on?: string
          name?: string
          notes?: string | null
          recurrence?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          amount_off_cents: number | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          percent_off: number | null
          profile_id: string
          times_redeemed: number
        }
        Insert: {
          amount_off_cents?: number | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          percent_off?: number | null
          profile_id: string
          times_redeemed?: number
        }
        Update: {
          amount_off_cents?: number | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          percent_off?: number | null
          profile_id?: string
          times_redeemed?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      date_overrides: {
        Row: {
          date: string
          end_time: string | null
          id: string
          is_available: boolean
          schedule_id: string
          start_time: string | null
        }
        Insert: {
          date: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          schedule_id: string
          start_time?: string | null
        }
        Update: {
          date?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          schedule_id?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "date_overrides_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "availability_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          buffer_after_minutes: number
          buffer_before_minutes: number
          color: string
          created_at: string
          currency: string
          description: string | null
          duration_minutes: number
          group_capacity: number
          id: string
          is_active: boolean
          is_paid: boolean
          kind: string
          location_type: string
          location_value: string | null
          max_bookings_per_day: number | null
          min_notice_minutes: number
          position: number
          price_cents: number
          profile_id: string
          schedule_id: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          color?: string
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes: number
          group_capacity?: number
          id?: string
          is_active?: boolean
          is_paid?: boolean
          kind?: string
          location_type?: string
          location_value?: string | null
          max_bookings_per_day?: number | null
          min_notice_minutes?: number
          position?: number
          price_cents?: number
          profile_id: string
          schedule_id?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          color?: string
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number
          group_capacity?: number
          id?: string
          is_active?: boolean
          is_paid?: boolean
          kind?: string
          location_type?: string
          location_value?: string | null
          max_bookings_per_day?: number | null
          min_notice_minutes?: number
          position?: number
          price_cents?: number
          profile_id?: string
          schedule_id?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_types_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_types_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "availability_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      host_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          plan: string
          profile_id: string
          refunded_at: string | null
          status: string
          stripe_checkout_session_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          plan?: string
          profile_id: string
          refunded_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          plan?: string
          profile_id?: string
          refunded_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "host_purchases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      package_purchases: {
        Row: {
          created_at: string
          id: string
          invitee_email: string
          invitee_name: string
          package_id: string
          sessions_remaining: number
          status: string
          stripe_checkout_session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_email: string
          invitee_name: string
          package_id: string
          sessions_remaining: number
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invitee_email?: string
          invitee_name?: string
          package_id?: string
          sessions_remaining?: number
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          currency: string
          event_type_id: string | null
          id: string
          interval: string | null
          is_active: boolean
          is_subscription: boolean
          name: string
          price_cents: number
          profile_id: string
          session_count: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          event_type_id?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean
          is_subscription?: boolean
          name: string
          price_cents: number
          profile_id: string
          session_count: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          event_type_id?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean
          is_subscription?: boolean
          name?: string
          price_cents?: number
          profile_id?: string
          session_count?: number
          stripe_price_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          brand_color: string
          created_at: string
          display_name: string
          id: string
          onboarded: boolean
          timezone: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          brand_color?: string
          created_at?: string
          display_name: string
          id: string
          onboarded?: boolean
          timezone?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          brand_color?: string
          created_at?: string
          display_name?: string
          id?: string
          onboarded?: boolean
          timezone?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cancel_pending_booking: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: undefined
      }
      cancel_pending_host_purchase: {
        Args: { p_host_purchase_id: string }
        Returns: undefined
      }
      cancel_pending_package_purchase: {
        Args: { p_package_purchase_id: string }
        Returns: undefined
      }
      confirm_package_purchase: {
        Args: { p_package_purchase_id: string; p_stripe_session_id: string }
        Returns: undefined
      }
      create_host_purchase_intent: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_package_purchase_intent: {
        Args: {
          p_invitee_email: string
          p_invitee_name: string
          p_package_id: string
        }
        Returns: Json
      }
      create_public_booking: {
        Args: {
          p_coupon_code?: string
          p_end_time: string
          p_event_type_id: string
          p_invitee_email: string
          p_invitee_name: string
          p_invitee_notes?: string
          p_invitee_timezone: string
          p_package_purchase_id?: string
          p_start_time: string
        }
        Returns: Json
      }
      get_available_package_session: {
        Args: { p_event_type_id: string; p_invitee_email: string }
        Returns: Json
      }
      get_booking_confirmation: {
        Args: { p_booking_id: string }
        Returns: Json
      }
      get_booking_email_context: {
        Args: { p_booking_id: string }
        Returns: Json
      }
      get_booking_for_checkout: {
        Args: { p_booking_id: string }
        Returns: Json
      }
      get_package_for_checkout: {
        Args: { p_package_id: string }
        Returns: Json
      }
      get_package_purchase_confirmation: {
        Args: { p_package_purchase_id: string }
        Returns: Json
      }
      get_package_purchase_email_context: {
        Args: { p_package_purchase_id: string }
        Returns: Json
      }
      get_public_availability_data: {
        Args: { p_event_type_id: string }
        Returns: Json
      }
      submit_booking_review: {
        Args: { p_booking_id: string; p_comment?: string; p_rating: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
