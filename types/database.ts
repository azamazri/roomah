/**
 * Auto-generated Supabase database types
 * Based on schema migrations
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          birth_date: string | null;
          gender: "male" | "female" | null;
          profile_image_url: string | null;
          city: string | null;
          province_id: string | null;
          bio: string | null;
          role: "guest" | "user" | "admin" | "moderator";
          account_status: "onboarding" | "active" | "suspended" | "deleted";
          otp_secret: string | null;
          otp_verified: boolean;
          last_otp_sent_at: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      provinces: {
        Row: {
          id: string;
          code: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["provinces"]["Row"], "created_at" | "id">;
        Update: Partial<Database["public"]["Tables"]["provinces"]["Row"]>;
      };
      sequences: {
        Row: {
          id: string;
          sequence_name: string;
          current_value: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sequences"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sequences"]["Row"]>;
      };
      onboarding_verifications: {
        Row: {
          id: string;
          profile_id: string;
          step: "phone" | "email" | "cv_data" | "fiveq" | "completed";
          status: "pending" | "verified" | "rejected";
          data: Record<string, unknown> | null;
          retry_count: number;
          rejected_reason: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["onboarding_verifications"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["onboarding_verifications"]["Row"]>;
      };
      cv_data: {
        Row: {
          id: string;
          profile_id: string;
          category: "education" | "work" | "skills" | "certification" | "language" | "project";
          title: string;
          description: string;
          data: Record<string, unknown>;
          display_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cv_data"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cv_data"]["Row"]>;
      };
      taaruf_requests: {
        Row: {
          id: string;
          from_profile_id: string;
          to_profile_id: string;
          status: "pending" | "accepted" | "rejected" | "cancelled";
          message: string | null;
          responded_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["taaruf_requests"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["taaruf_requests"]["Row"]>;
      };
      taaruf_active: {
        Row: {
          id: string;
          profile_id_1: string;
          profile_id_2: string;
          request_id: string;
          status: "active" | "paused" | "ended";
          started_at: string;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["taaruf_active"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["taaruf_active"]["Row"]>;
      };
      wallet_ledger: {
        Row: {
          id: string;
          profile_id: string;
          transaction_type: "topup" | "debit" | "refund";
          amount: number;
          balance_after: number;
          description: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wallet_ledger"]["Row"], "created_at">;
        Update: never;
      };
      topup_orders: {
        Row: {
          id: string;
          profile_id: string;
          amount: number;
          coin_amount: number;
          status: "pending" | "completed" | "failed" | "cancelled";
          payment_method: "midtrans" | "manual";
          midtrans_transaction_id: string | null;
          midtrans_order_id: string | null;
          payment_proof_url: string | null;
          completed_at: string | null;
          failed_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["topup_orders"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["topup_orders"]["Row"]>;
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          changes: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "created_at">;
        Update: never;
      };
      approved_candidates: {
        Row: {
          id: string;
          profile_id: string;
          phone_verified: boolean;
          email_verified: boolean;
          cv_approved: boolean;
          fiveq_completed: boolean;
          account_created_at: string;
          last_active_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_next_sequence: {
        Args: {
          seq_name: string;
        };
        Returns: number;
      };
      check_taaruf_eligibility: {
        Args: {
          from_user_id: string;
          to_user_id: string;
        };
        Returns: {
          eligible: boolean;
          reason: string | null;
        }[];
      };
      calculate_wallet_balance: {
        Args: {
          user_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      user_role: "guest" | "user" | "admin" | "moderator";
      account_status: "onboarding" | "active" | "suspended" | "deleted";
      gender_enum: "male" | "female";
      cv_category: "education" | "work" | "skills" | "certification" | "language" | "project";
      taaruf_status: "pending" | "accepted" | "rejected" | "cancelled";
      active_taaruf_status: "active" | "paused" | "ended";
      transaction_type: "topup" | "debit" | "refund";
      payment_method: "midtrans" | "manual";
      topup_status: "pending" | "completed" | "failed" | "cancelled";
    };
  };
};
