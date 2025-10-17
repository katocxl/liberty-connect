export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string;
          actor_id: string;
          created_at: string;
          id: string;
          org_id: string;
          payload: Json | null;
          target_id: string | null;
          target_type: string;
        };
        Insert: {
          action: string;
          actor_id: string;
          created_at?: string;
          id?: string;
          org_id: string;
          payload?: Json | null;
          target_id?: string | null;
          target_type: string;
        };
        Update: {
          action?: string;
          actor_id?: string;
          created_at?: string;
          id?: string;
          org_id?: string;
          payload?: Json | null;
          target_id?: string | null;
          target_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_actions_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_actions_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          expires_at: string | null;
          hero_image_path: string | null;
          hidden_at: string | null;
          id: string;
          org_id: string;
          pinned: boolean;
          published_at: string;
          search_vector: unknown | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          expires_at?: string | null;
          hero_image_path?: string | null;
          hidden_at?: string | null;
          id?: string;
          org_id: string;
          pinned?: boolean;
          published_at?: string;
          search_vector?: unknown | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          expires_at?: string | null;
          hero_image_path?: string | null;
          hidden_at?: string | null;
          id?: string;
          org_id?: string;
          pinned?: boolean;
          published_at?: string;
          search_vector?: unknown | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcements_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      blocks: {
        Row: {
          blocked_user_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
          org_id: string;
          reason: string | null;
        };
        Insert: {
          blocked_user_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
          org_id: string;
          reason?: string | null;
        };
        Update: {
          blocked_user_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
          org_id?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_user_id_fkey";
            columns: ["blocked_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      checkins: {
        Row: {
          checked_in_at: string;
          event_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          checked_in_at?: string;
          event_id: string;
          id?: string;
          user_id: string;
        };
        Update: {
          checked_in_at?: string;
          event_id?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checkins_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkins_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      device_tokens: {
        Row: {
          created_at: string;
          disabled_at: string | null;
          id: string;
          last_seen_at: string;
          org_id: string;
          platform: Database["public"]["Enums"]["device_platform"];
          token: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          disabled_at?: string | null;
          id?: string;
          last_seen_at?: string;
          org_id: string;
          platform: Database["public"]["Enums"]["device_platform"];
          token: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          disabled_at?: string | null;
          id?: string;
          last_seen_at?: string;
          org_id?: string;
          platform?: Database["public"]["Enums"]["device_platform"];
          token?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "device_tokens_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "device_tokens_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      devotionals: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          org_id: string;
          published_at: string;
          scripture_reference: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          org_id: string;
          published_at?: string;
          scripture_reference?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          org_id?: string;
          published_at?: string;
          scripture_reference?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "devotionals_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "devotionals_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          all_day: boolean;
          capacity: number | null;
          cover_image_path: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          end_at: string | null;
          id: string;
          location: string | null;
          location_url: string | null;
          org_id: string;
          start_at: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          all_day?: boolean;
          capacity?: number | null;
          cover_image_path?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          end_at?: string | null;
          id?: string;
          location?: string | null;
          location_url?: string | null;
          org_id: string;
          start_at: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          all_day?: boolean;
          capacity?: number | null;
          cover_image_path?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          end_at?: string | null;
          id?: string;
          location?: string | null;
          location_url?: string | null;
          org_id?: string;
          start_at?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_preferences: {
        Row: {
          announcements: boolean;
          created_at: string;
          devotionals: boolean;
          events: boolean;
          id: string;
          org_id: string;
          prayer_replies: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          announcements?: boolean;
          created_at?: string;
          devotionals?: boolean;
          events?: boolean;
          id?: string;
          org_id: string;
          prayer_replies?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          announcements?: boolean;
          created_at?: string;
          devotionals?: boolean;
          events?: boolean;
          id?: string;
          org_id?: string;
          prayer_replies?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      organization_members: {
        Row: {
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          joined_at: string | null;
          last_seen_at: string | null;
          org_id: string;
          role: Database["public"]["Enums"]["member_role"];
          status: Database["public"]["Enums"]["member_status"];
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          last_seen_at?: string | null;
          org_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          last_seen_at?: string | null;
          org_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          status?: Database["public"]["Enums"]["member_status"];
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey";
            columns: ["invited_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      organizations: {
        Row: {
          allow_guest_access: boolean;
          created_at: string;
          default_locale: string;
          id: string;
          name: string;
          slug: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          allow_guest_access?: boolean;
          created_at?: string;
          default_locale?: string;
          id?: string;
          name: string;
          slug: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          allow_guest_access?: boolean;
          created_at?: string;
          default_locale?: string;
          id?: string;
          name?: string;
          slug?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prayer_reactions: {
        Row: {
          created_at: string;
          emoji: string;
          prayer_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emoji: string;
          prayer_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emoji?: string;
          prayer_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_prayer_id_fkey";
            columns: ["prayer_id"];
            referencedRelation: "prayers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prayer_reactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      prayers: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          hidden_at: string | null;
          id: string;
          is_anonymous: boolean;
          org_id: string;
          search_vector: unknown | null;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body: string;
          created_at?: string;
          hidden_at?: string | null;
          id?: string;
          is_anonymous?: boolean;
          org_id: string;
          search_vector?: unknown | null;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          hidden_at?: string | null;
          id?: string;
          is_anonymous?: boolean;
          org_id?: string;
          search_vector?: unknown | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prayers_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prayers_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      reports: {
        Row: {
          created_at: string;
          details: Json | null;
          hidden_at: string | null;
          id: string;
          org_id: string;
          reason: string;
          reporter_id: string;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_note: string | null;
          status: Database["public"]["Enums"]["report_status"];
          target_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
        };
        Insert: {
          created_at?: string;
          details?: Json | null;
          hidden_at?: string | null;
          id?: string;
          org_id: string;
          reason: string;
          reporter_id: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          target_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
        };
        Update: {
          created_at?: string;
          details?: Json | null;
          hidden_at?: string | null;
          id?: string;
          org_id?: string;
          reason?: string;
          reporter_id?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          target_id?: string;
          target_type?: Database["public"]["Enums"]["report_target_type"];
        };
        Relationships: [
          {
            foreignKeyName: "reports_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      rsvps: {
        Row: {
          created_at: string;
          event_id: string;
          notes: string | null;
          status: Database["public"]["Enums"]["rsvp_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["rsvp_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["rsvp_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rsvps_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_org_role: {
        Args: {
          target_org: string;
          roles: Database["public"]["Enums"]["member_role"][];
        };
        Returns: boolean;
      };
      housekeeping_ttl: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      invoke_event_reminder_30m: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      is_active_member: {
        Args: {
          target_org: string;
        };
        Returns: boolean;
      };
      is_guest_allowed: {
        Args: {
          target_org: string;
        };
        Returns: boolean | null;
      };
      safe_cast_uuid: {
        Args: {
          value: string | null;
        };
        Returns: string | null;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      storage_object_org_id: {
        Args: {
          object_name: string;
        };
        Returns: string | null;
      };
    };
    Enums: {
      device_platform: "ios" | "android" | "web";
      member_role: "owner" | "moderator" | "member";
      member_status: "active" | "invited" | "suspended";
      report_status: "open" | "in_review" | "resolved" | "dismissed";
      report_target_type: "prayer" | "announcement" | "devotional" | "event" | "user";
      rsvp_status: "yes" | "no" | "maybe";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucket_id_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
