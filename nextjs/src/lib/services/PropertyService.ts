import { createSPASassClient } from "@/lib/supabase/client";
import { PropertyWithDetails } from "@/hooks/use-property-details";

/**
 * Service class for managing property operations
 */
export class PropertyService {
  /**
   * Fetch a property by its ID including all related data
   */
  static async getPropertyById(
    propertyId: string
  ): Promise<PropertyWithDetails | null> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();

      // Get base property data
      const { data: propertyData, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();

      if (error) throw error;
      if (!propertyData) return null;

      // Get address data
      let address = null;
      if (propertyData.address_id) {
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", propertyData.address_id)
          .single();

        if (!addressError) {
          address = addressData;
        }
      }

      // Get current lease
      let current_lease = null;
      const { data: leases, error: leasesError } = await supabase
        .from("leases")
        .select("*")
        .eq("property_id", propertyId)
        .eq("status", "active")
        .order("start_date", { ascending: false })
        .limit(1);

      if (!leasesError && leases?.length > 0) {
        const lease = leases[0];

        // Get tenant info if available
        let tenant = null;
        if (lease.tenant_id) {
          const { data: tenantData, error: tenantError } = await supabase
            .from("tenants")
            .select("*")
            .eq("id", lease.tenant_id)
            .single();

          if (!tenantError) {
            tenant = tenantData;
          }
        }

        current_lease = {
          ...lease,
          tenant,
        };
      }

      return {
        ...propertyData,
        address,
        current_lease,
      };
    } catch (error) {
      console.error("Error fetching property:", error);
      throw error;
    }
  }

  /**
   * Get properties by owner
   */
  static async getPropertiesByOwner(
    ownerId: string
  ): Promise<PropertyWithDetails[]> {
    if (!ownerId) {
      throw new Error("Owner ID is required");
    }

    try {
      const supabase = await createSPASassClient();

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", ownerId);

      if (error) throw error;

      // Fetch details for each property
      const detailedProperties = await Promise.all(
        data.map(async (property) => {
          return await this.getPropertyById(property.id);
        })
      );

      return detailedProperties.filter(Boolean) as PropertyWithDetails[];
    } catch (error) {
      console.error("Error fetching properties by owner:", error);
      throw error;
    }
  }

  /**
   * Create a new property
   */
  static async createProperty(
    propertyData: Partial<PropertyWithDetails>
  ): Promise<PropertyWithDetails> {
    if (!propertyData.owner_id) {
      throw new Error("Owner ID is required");
    }

    try {
      const supabase = await createSPASassClient();

      const { data, error } = await supabase
        .from("properties")
        .insert(propertyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  }

  /**
   * Update an existing property
   */
  static async updateProperty(
    propertyId: string,
    updates: Partial<PropertyWithDetails>
  ): Promise<PropertyWithDetails> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();

      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", propertyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  }

  /**
   * Delete a property and all related data
   */
  static async deleteProperty(propertyId: string): Promise<boolean> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();

      // Use the database function to handle all cascading deletes
      const { data, error } = await supabase.rpc(
        "delete_property_and_related_data",
        { property_id_input: propertyId }
      );

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
  }
}
