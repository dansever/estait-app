export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          apartment_number: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          state: string | null
          street: string | null
          street_number: number | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          apartment_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          state?: string | null
          street?: string | null
          street_number?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          apartment_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          state?: string | null
          street?: string | null
          street_number?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["DOCUMENT_TYPE"] | null
          file_name: string
          file_size_kb: number | null
          id: string
          lease_id: string | null
          mime_type: string
          property_id: string | null
          storage_full_path: string | null
          tenant_id: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["DOCUMENT_TYPE"] | null
          file_name: string
          file_size_kb?: number | null
          id?: string
          lease_id?: string | null
          mime_type: string
          property_id?: string | null
          storage_full_path?: string | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["DOCUMENT_TYPE"] | null
          file_name?: string
          file_size_kb?: number | null
          id?: string
          lease_id?: string | null
          mime_type?: string
          property_id?: string | null
          storage_full_path?: string | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          is_lease_active: boolean | null
          lease_end: string
          lease_start: string
          notes: string | null
          payment_due_day: number | null
          payment_frequency:
            | Database["public"]["Enums"]["PAYMENT_FREQUENCY"]
            | null
          property_id: string | null
          rent_amount: number
          security_deposit: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          is_lease_active?: boolean | null
          lease_end: string
          lease_start: string
          notes?: string | null
          payment_due_day?: number | null
          payment_frequency?:
            | Database["public"]["Enums"]["PAYMENT_FREQUENCY"]
            | null
          property_id?: string | null
          rent_amount?: number
          security_deposit?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          is_lease_active?: boolean | null
          lease_end?: string
          lease_start?: string
          notes?: string | null
          payment_due_day?: number | null
          payment_frequency?:
            | Database["public"]["Enums"]["PAYMENT_FREQUENCY"]
            | null
          property_id?: string | null
          rent_amount?: number
          security_deposit?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["PRIORITY"] | null
          property_id: string | null
          task_status: Database["public"]["Enums"]["TASK_STATUS"]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["PRIORITY"] | null
          property_id?: string | null
          task_status?: Database["public"]["Enums"]["TASK_STATUS"]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["PRIORITY"] | null
          property_id?: string | null
          task_status?: Database["public"]["Enums"]["TASK_STATUS"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          currency: string
          description: string | null
          document_ids: Json
          id: string
          image_ids: Json
          notes: string | null
          parking_spaces: number
          property_type: Database["public"]["Enums"]["PROPERTY_TYPE"] | null
          purchase_price: number | null
          size: number | null
          title: string
          unit_system: string
          user_id: string
          year_built: number | null
        }
        Insert: {
          address_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          document_ids?: Json
          id?: string
          image_ids?: Json
          notes?: string | null
          parking_spaces?: number
          property_type?: Database["public"]["Enums"]["PROPERTY_TYPE"] | null
          purchase_price?: number | null
          size?: number | null
          title: string
          unit_system?: string
          user_id: string
          year_built?: number | null
        }
        Update: {
          address_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          document_ids?: Json
          id?: string
          image_ids?: Json
          notes?: string | null
          parking_spaces?: number
          property_type?: Database["public"]["Enums"]["PROPERTY_TYPE"] | null
          purchase_price?: number | null
          size?: number | null
          title?: string
          unit_system?: string
          user_id?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          lease_id: string | null
          notes: string | null
          property_id: string | null
          receipt_url: string | null
          transaction_date: string
          transaction_type:
            | Database["public"]["Enums"]["TRANSACTION_TYPE"]
            | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          lease_id?: string | null
          notes?: string | null
          property_id?: string | null
          receipt_url?: string | null
          transaction_date?: string
          transaction_type?:
            | Database["public"]["Enums"]["TRANSACTION_TYPE"]
            | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          lease_id?: string | null
          notes?: string | null
          property_id?: string | null
          receipt_url?: string | null
          transaction_date?: string
          transaction_type?:
            | Database["public"]["Enums"]["TRANSACTION_TYPE"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          timezone: string | null
          user_plan: Database["public"]["Enums"]["USER_PLAN"]
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          phone?: string | null
          timezone?: string | null
          user_plan?: Database["public"]["Enums"]["USER_PLAN"]
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          timezone?: string | null
          user_plan?: Database["public"]["Enums"]["USER_PLAN"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_property_and_related_data: {
        Args: { property_id_input: string }
        Returns: boolean
      }
      insert_document: {
        Args: { property_id: string; file_name: string }
        Returns: undefined
      }
      update_lease_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      DOCUMENT_TYPE:
        | "lease_agreement"
        | "id_verification"
        | "insurance"
        | "payment_receipt"
        | "maintenance"
        | "property_photo"
        | "utility_bill"
        | "tax_document"
        | "other"
      LEASE_STATUS: "active" | "non-active"
      PAYMENT_FREQUENCY:
        | "monthly"
        | "weekly"
        | "biweekly"
        | "quarterly"
        | "annually"
      PRIORITY: "low" | "medium" | "high"
      PROPERTY_TYPE:
        | "apartment"
        | "house"
        | "duplex"
        | "condo"
        | "commercial"
        | "land"
        | "other"
      TASK_STATUS: "open" | "completed"
      TRANSACTION_CATEGORY:
        | "rent"
        | "utilities"
        | "maintenance"
        | "property_tax"
        | "insurance"
        | "management_fee"
        | "deposit"
        | "legal"
        | "other"
      TRANSACTION_TYPE: "expense" | "income"
      USER_PLAN: "starter" | "pro" | "scale"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      DOCUMENT_TYPE: [
        "lease_agreement",
        "id_verification",
        "insurance",
        "payment_receipt",
        "maintenance",
        "property_photo",
        "utility_bill",
        "tax_document",
        "other",
      ],
      LEASE_STATUS: ["active", "non-active"],
      PAYMENT_FREQUENCY: [
        "monthly",
        "weekly",
        "biweekly",
        "quarterly",
        "annually",
      ],
      PRIORITY: ["low", "medium", "high"],
      PROPERTY_TYPE: [
        "apartment",
        "house",
        "duplex",
        "condo",
        "commercial",
        "land",
        "other",
      ],
      TASK_STATUS: ["open", "completed"],
      TRANSACTION_CATEGORY: [
        "rent",
        "utilities",
        "maintenance",
        "property_tax",
        "insurance",
        "management_fee",
        "deposit",
        "legal",
        "other",
      ],
      TRANSACTION_TYPE: ["expense", "income"],
      USER_PLAN: ["starter", "pro", "scale"],
    },
  },
} as const
