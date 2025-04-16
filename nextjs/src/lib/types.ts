export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          apartment_number: string | null;
          city: string | null;
          country: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          state: string | null;
          street: string | null;
          zip_code: string | null;
        };
        Insert: {
          apartment_number?: string | null;
          city?: string | null;
          country?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          state?: string | null;
          street?: string | null;
          zip_code?: string | null;
        };
        Update: {
          apartment_number?: string | null;
          city?: string | null;
          country?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          state?: string | null;
          street?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      document_types: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          file_name: string;
          file_url: string;
          id: string;
          lease_id: string | null;
          mime_type: string;
          property_id: string | null;
          tenant_id: string | null;
          type_id: string | null;
          uploaded_at: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          file_name: string;
          file_url: string;
          id?: string;
          lease_id?: string | null;
          mime_type: string;
          property_id?: string | null;
          tenant_id?: string | null;
          type_id?: string | null;
          uploaded_at?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          file_name?: string;
          file_url?: string;
          id?: string;
          lease_id?: string | null;
          mime_type?: string;
          property_id?: string | null;
          tenant_id?: string | null;
          type_id?: string | null;
          uploaded_at?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_lease_id_fkey";
            columns: ["lease_id"];
            isOneToOne: false;
            referencedRelation: "leases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "document_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      leases: {
        Row: {
          created_at: string | null;
          id: string;
          lease_end: string;
          lease_start: string;
          notes: string | null;
          payment_frequency: string | null;
          property_id: string | null;
          rent_amount: number;
          currency: string | null;
          payment_due_day?: number;
          security_deposit: number | null;
          status: string | null;
          tenant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          lease_end: string;
          lease_start: string;
          notes?: string | null;
          payment_frequency?: string | null;
          property_id?: string | null;
          rent_amount: number;
          currency: string | null;
          payment_due_day?: number;
          security_deposit?: number | null;
          status?: string | null;
          tenant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          lease_end?: string;
          lease_start?: string;
          notes?: string | null;
          payment_frequency?: string | null;
          property_id?: string | null;
          rent_amount?: number;
          currency: string | null;
          payment_due_day?: number;
          security_deposit?: number | null;
          status?: string | null;
          tenant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leases_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      maintenance_tasks: {
        Row: {
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: string | null;
          property_id: string | null;
          status: string | null;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          property_id?: string | null;
          status?: string | null;
          title: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          property_id?: string | null;
          status?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      properties: {
        Row: {
          address_id: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          created_at: string | null;
          currency: string | null;
          id: string;
          notes: string | null;
          owner_id: string | null;
          purchase_price: number | null;
          size: number | null;
          title: string;
          unit_label: string | null;
          unit_system: string;
          year_built: number | null;
        };
        Insert: {
          address_id?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          notes?: string | null;
          owner_id?: string | null;
          purchase_price?: number | null;
          size?: number | null;
          title: string;
          unit_label?: string | null;
          unit_system?: string;
          year_built?: number | null;
        };
        Update: {
          address_id?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          notes?: string | null;
          owner_id?: string | null;
          purchase_price?: number | null;
          size?: number | null;
          title?: string;
          unit_label?: string | null;
          unit_system?: string;
          year_built?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "properties_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tenants: {
        Row: {
          created_at: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          notes: string | null;
          phone: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          notes?: string | null;
          phone?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          notes?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      // todo_list: {
      //   Row: {
      //     created_at: string;
      //     description: string | null;
      //     done: boolean;
      //     done_at: string | null;
      //     id: number;
      //     owner: string;
      //     title: string;
      //     urgent: boolean;
      //   };
      //   Insert: {
      //     created_at?: string;
      //     description?: string | null;
      //     done?: boolean;
      //     done_at?: string | null;
      //     id?: number;
      //     owner: string;
      //     title: string;
      //     urgent?: boolean;
      //   };
      //   Update: {
      //     created_at?: string;
      //     description?: string | null;
      //     done?: boolean;
      //     done_at?: string | null;
      //     id?: number;
      //     owner?: string;
      //     title?: string;
      //     urgent?: boolean;
      //   };
      //   Relationships: [];
      // };
      transaction_categories: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          category_id: string | null;
          created_at: string | null;
          date: string;
          description: string | null;
          id: string;
          lease_id: string | null;
          notes: string | null;
          property_id: string | null;
          receipt_url: string | null;
          type: string;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          created_at?: string | null;
          date: string;
          description?: string | null;
          id?: string;
          lease_id?: string | null;
          notes?: string | null;
          property_id?: string | null;
          receipt_url?: string | null;
          type: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          created_at?: string | null;
          date?: string;
          description?: string | null;
          id?: string;
          lease_id?: string | null;
          notes?: string | null;
          property_id?: string | null;
          receipt_url?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "transaction_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_lease_id_fkey";
            columns: ["lease_id"];
            isOneToOne: false;
            referencedRelation: "leases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          company_name: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          onboarding_completed: boolean | null;
          phone: string | null;
          plan: string | null;
          timezone: string | null;
        };
        Insert: {
          company_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          plan?: string | null;
          timezone?: string | null;
        };
        Update: {
          company_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          plan?: string | null;
          timezone?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_lease_status: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
