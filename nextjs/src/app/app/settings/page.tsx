"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { NavTabs, type TabItem } from "@/components/layout/app-tabs";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { MFASetup } from "@/components/MFASetup";
import {
  Key,
  User,
  CheckCircle,
  Bell,
  Globe,
  UserCircle,
  Wallet,
  Upload,
  Trash2,
  CreditCard,
  LogOut,
  Clock,
  Building2,
  X,
  Check,
  AlarmClock,
  Smartphone,
  Mail,
  Loader2,
  Edit,
  Save,
} from "lucide-react";

// Define the user profile type based on Supabase schema
interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  timezone: string | null;
  user_plan: string;
  registered_at?: Date;
}

export default function UserSettingsPage() {
  const { user } = useGlobal();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formProfile, setFormProfile] = useState<Partial<UserProfile>>({});

  // Mock integration data
  const mockIntegrations = {
    stripe: {
      connected: true,
      date: "Jan 5, 2025",
    },
    zillow: {
      connected: false,
      date: null,
    },
    paypal: {
      connected: true,
      date: "Mar 22, 2025",
    },
  };

  // Fetch user profile on component mount
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    setError("");

    try {
      const supabase = await createSPASassClient();

      // Fetch user details from the users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email || user?.email || null,
          full_name: data.full_name,
          company_name: data.company_name,
          phone: data.phone,
          timezone: data.timezone || "America/New_York",
          user_plan: data.user_plan,
          registered_at: user?.registered_at,
        };

        setUserProfile(profile);
        setFormProfile(profile);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
      } else {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Reset form to current profile if canceling edit
      setFormProfile(userProfile || {});
    }
    setIsEditMode(!isEditMode);
  };

  const saveUserProfile = async () => {
    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const supabase = await createSPASassClient();

      // Extract only updatable fields
      const updatedProfile = {
        full_name: formProfile.full_name,
        company_name: formProfile.company_name,
        phone: formProfile.phone,
        timezone: formProfile.timezone,
      };

      // Update user profile in Supabase
      const { error } = await supabase
        .from("users")
        .update(updatedProfile)
        .eq("id", user!.id);

      if (error) throw error;

      // Update local state with the updated profile
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: updatedProfile.full_name ?? prev.full_name,
              company_name: updatedProfile.company_name ?? prev.company_name,
              phone: updatedProfile.phone ?? prev.phone,
              timezone: updatedProfile.timezone ?? prev.timezone,
            }
          : null
      );

      setSuccess("Profile updated successfully");
      setIsEditMode(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error updating profile:", err);
        setError(err.message);
      } else {
        console.error("Error updating profile:", err);
        setError("Failed to update profile");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error updating password:", err);
        setError(err.message);
      } else {
        console.error("Error updating password:", err);
        setError("Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = await createSPASassClient();
      const fileName = `avatar-${user.id}-${Date.now()}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.uploadFile(
        user.id,
        fileName,
        file
      );

      if (uploadError) throw uploadError;

      setSuccess("Profile picture uploaded successfully");

      // You might want to update the user profile with the new avatar URL
      // This would require additional logic depending on how you store avatar URLs
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error uploading profile picture:", err);
        setError(err.message);
      } else {
        console.error("Error uploading profile picture:", err);
        setError("Failed to upload profile picture");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = (integration: string, currentStatus: boolean) => {
    // In a real app, this would connect/disconnect the integration
    console.log(
      `Toggle ${integration} from ${currentStatus} to ${!currentStatus}`
    );
    setSuccess(
      `${integration} ${
        currentStatus ? "disconnected" : "connected"
      } successfully`
    );

    // Update mock data for UI feedback
    if (integration === "stripe")
      mockIntegrations.stripe.connected = !currentStatus;
    if (integration === "zillow")
      mockIntegrations.zillow.connected = !currentStatus;
    if (integration === "paypal")
      mockIntegrations.paypal.connected = !currentStatus;
  };

  const deleteAccount = () => {
    // This would normally show a confirmation dialog
    console.log("Delete account requested");
    alert(
      "This is a placeholder. In a real app, this would delete your account after confirmation."
    );
  };

  // Define tab content
  const generalTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              User Details
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleEditMode}
            disabled={loading || savingProfile}
          >
            {isEditMode ? (
              <>Cancel</>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User ID
                  </label>
                  <p className="mt-1 text-sm">{user?.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-sm">
                    {userProfile?.email || user?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  {isEditMode ? (
                    <Input
                      className="mt-1"
                      placeholder="Full Name"
                      name="full_name"
                      value={formProfile.full_name || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="mt-1 text-sm">
                      {userProfile?.full_name || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Company Name
                  </label>
                  {isEditMode ? (
                    <Input
                      className="mt-1"
                      placeholder="Company Name"
                      name="company_name"
                      value={formProfile.company_name || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="mt-1 text-sm">
                      {userProfile?.company_name || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  {isEditMode ? (
                    <Input
                      className="mt-1"
                      placeholder="Phone Number"
                      name="phone"
                      value={formProfile.phone || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="mt-1 text-sm">
                      {userProfile?.phone || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Plan
                  </label>
                  <p className="mt-1 text-sm capitalize">
                    {userProfile?.user_plan || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Member Since
                  </label>
                  <p className="mt-1 text-sm">
                    {userProfile?.registered_at
                      ? new Date(userProfile.registered_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not available"}
                  </p>
                </div>
              </div>

              {isEditMode && (
                <div className="pt-4 border-t mt-6">
                  <Button
                    className="w-full"
                    onClick={saveUserProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <input
                      type="file"
                      id="profile-picture"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("profile-picture")?.click()
                      }
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload New Picture
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Configure your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Timezone
            </label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 text-sm"
              name="timezone"
              value={
                isEditMode
                  ? formProfile.timezone || "America/New_York"
                  : userProfile?.timezone || "America/New_York"
              }
              onChange={handleInputChange}
              disabled={!isEditMode}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Notification Preferences
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-notifications" defaultChecked={true} />
                <label
                  htmlFor="email-notifications"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Alerts
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="sms-notifications" defaultChecked={false} />
                <label
                  htmlFor="sms-notifications"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  SMS Alerts
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="push-notifications" defaultChecked={true} />
                <label
                  htmlFor="push-notifications"
                  className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  App Push Notifications
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4">
            <Button className="w-full">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const integrationsTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connect your accounts with third-party services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              <div>
                <h3 className="font-medium">Stripe</h3>
                <p className="text-sm text-gray-500">
                  {mockIntegrations.stripe.connected
                    ? `Connected on ${mockIntegrations.stripe.date}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <Button
              variant={
                mockIntegrations.stripe.connected ? "outline" : "default"
              }
              onClick={() =>
                toggleIntegration("stripe", mockIntegrations.stripe.connected)
              }
            >
              {mockIntegrations.stripe.connected ? (
                <>
                  <X className="h-4 w-4 mr-2" /> Disconnect
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Connect
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <div>
                <h3 className="font-medium">Zillow</h3>
                <p className="text-sm text-gray-500">
                  {mockIntegrations.zillow.connected
                    ? `Connected on ${mockIntegrations.zillow.date}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <Button
              variant={
                mockIntegrations.zillow.connected ? "outline" : "default"
              }
              onClick={() =>
                toggleIntegration("zillow", mockIntegrations.zillow.connected)
              }
            >
              {mockIntegrations.zillow.connected ? (
                <>
                  <X className="h-4 w-4 mr-2" /> Disconnect
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Connect
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8" />
              <div>
                <h3 className="font-medium">PayPal</h3>
                <p className="text-sm text-gray-500">
                  {mockIntegrations.paypal.connected
                    ? `Connected on ${mockIntegrations.paypal.date}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <Button
              variant={
                mockIntegrations.paypal.connected ? "outline" : "default"
              }
              onClick={() =>
                toggleIntegration("paypal", mockIntegrations.paypal.connected)
              }
            >
              {mockIntegrations.paypal.connected ? (
                <>
                  <X className="h-4 w-4 mr-2" /> Disconnect
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Connect
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const securityTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <Input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <Input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <MFASetup
        onStatusChange={() => {
          setSuccess("Two-factor authentication settings updated successfully");
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Manage your active sessions and devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-500">
                  Windows - Chrome - Apr 17, 2025
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="border p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Mobile App</p>
                <p className="text-sm text-gray-500">
                  iPhone 14 - iOS 17 - Apr 10, 2025
                </p>
              </div>
              <Button size="sm" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <Button variant="outline" className="w-full">
              Log Out from All Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="text-red-700">
                <p className="text-sm">
                  Warning: This action cannot be undone. This will permanently
                  delete your account and remove all data associated with it.
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={deleteAccount}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Define tabs for NavTabs component
  const tabs: TabItem[] = [
    {
      id: "general",
      label: "General",
      icon: User,
      content: generalTabContent,
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: Wallet,
      content: integrationsTabContent,
    },
    {
      id: "security",
      label: "Security",
      icon: Key,
      content: securityTabContent,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <NavTabs tabs={tabs} className="mt-6" />
    </div>
  );
}
