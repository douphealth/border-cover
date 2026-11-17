export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      correction_reports: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          rule_id: string
          rule_version: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          message: string
          rule_id: string
          rule_version: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          rule_id?: string
          rule_version?: string
          status?: string
        }
        Relationships: []
      }
      evidence_history: {
        Row: {
          actor_id: string
          changed_at: string
          id: string
          record: Json
          review_id: string
        }
        Insert: {
          actor_id: string
          changed_at?: string
          id?: string
          record: Json
          review_id: string
        }
        Update: {
          actor_id?: string
          changed_at?: string
          id?: string
          record?: Json
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_history_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "approved_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_history_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "evidence_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_reviews: {
        Row: {
          approved_by: string | null
          conflicts: string
          created_at: string
          created_by: string
          human_verified_at: string | null
          id: string
          policy_edition: string
          quotation: string
          review_due: string
          reviewer_name: string
          rule_id: string
          section: string
          source_id: string
          status: string
        }
        Insert: {
          approved_by?: string | null
          conflicts?: string
          created_at?: string
          created_by: string
          human_verified_at?: string | null
          id?: string
          policy_edition: string
          quotation: string
          review_due: string
          reviewer_name: string
          rule_id: string
          section: string
          source_id: string
          status?: string
        }
        Update: {
          approved_by?: string | null
          conflicts?: string
          created_at?: string
          created_by?: string
          human_verified_at?: string | null
          id?: string
          policy_edition?: string
          quotation?: string
          review_due?: string
          reviewer_name?: string
          rule_id?: string
          section?: string
          source_id?: string
          status?: string
        }
        Relationships: []
      }
      review_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          reason: string
          resolved_at: string | null
          source_id: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          reason: string
          resolved_at?: string | null
          source_id: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          reason?: string
          resolved_at?: string | null
          source_id?: string
          status?: string
        }
        Relationships: []
      }
      source_observations: {
        Row: {
          content_hash: string | null
          http_status: number | null
          id: string
          observed_at: string
          outcome: string
          source_id: string
        }
        Insert: {
          content_hash?: string | null
          http_status?: number | null
          id?: string
          observed_at?: string
          outcome: string
          source_id: string
        }
        Update: {
          content_hash?: string | null
          http_status?: number | null
          id?: string
          observed_at?: string
          outcome?: string
          source_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      approved_evidence: {
        Row: {
          conflicts: string | null
          human_verified_at: string | null
          id: string | null
          policy_edition: string | null
          quotation: string | null
          review_due: string | null
          reviewer_name: string | null
          rule_id: string | null
          section: string | null
          source_id: string | null
        }
        Insert: {
          conflicts?: string | null
          human_verified_at?: string | null
          id?: string | null
          policy_edition?: string | null
          quotation?: string | null
          review_due?: string | null
          reviewer_name?: string | null
          rule_id?: string | null
          section?: string | null
          source_id?: string | null
        }
        Update: {
          conflicts?: string | null
          human_verified_at?: string | null
          id?: string | null
          policy_edition?: string | null
          quotation?: string | null
          review_due?: string | null
          reviewer_name?: string | null
          rule_id?: string | null
          section?: string | null
          source_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "reviewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["reviewer"],
    },
  },
} as const
