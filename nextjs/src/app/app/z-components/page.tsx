"use client";

import React from "react";
import { NavTabs, TabItem } from "@/components/layout/app-tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  Terminal,
  Info,
  Check,
  LucideIcon,
  CheckCircle,
  X,
  ArrowRight,
  Home,
  Settings,
  Users,
  Mail,
  Plus,
  CalendarDays,
} from "lucide-react";

export default function ComponentsPage() {
  const tabs: TabItem[] = [
    {
      id: "buttons",
      label: "Buttons",
      content: <ButtonShowcase />,
    },
    {
      id: "badges",
      label: "Badges",
      content: <BadgeShowcase />,
    },
    {
      id: "cards",
      label: "Cards",
      content: <CardShowcase />,
    },
    {
      id: "alerts",
      label: "Alerts",
      content: <AlertShowcase />,
    },
    {
      id: "dialogs",
      label: "Dialogs",
      content: <DialogShowcase />,
    },
    {
      id: "forms",
      label: "Form Controls",
      content: <FormsShowcase />,
    },
    {
      id: "navigation",
      label: "Navigation",
      content: <NavigationShowcase />,
    },
    {
      id: "feedback",
      label: "Feedback",
      content: <FeedbackShowcase />,
    },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Component Library</h1>
      <NavTabs tabs={tabs} defaultTabId="buttons" />
    </div>
  );
}

// Button Component Showcase
function ButtonShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="outlineDestructive">Outline Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="default">Default Size</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Icon Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Item
          </Button>
          <Button variant="outline">
            <Check className="mr-2 h-4 w-4" /> Confirm
          </Button>
          <Button variant="secondary" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Badge Component Showcase
function BadgeShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Badge Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="outlineDestructive">Outline Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Badge with Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>
            <Check className="mr-1 h-3 w-3" /> Completed
          </Badge>
          <Badge variant="secondary">
            <Calendar className="mr-1 h-3 w-3" /> Scheduled
          </Badge>
          <Badge variant="outline">
            <Users className="mr-1 h-3 w-3" /> Team
          </Badge>
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" /> Critical
          </Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <Badge variant="outline">Active</Badge>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
            <Badge variant="outline">Pending</Badge>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
            <Badge variant="outline">Offline</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card Component Showcase
function CardShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Card</h2>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Card content goes here. This is where the main content is
              displayed.
            </p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Card Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>You have 3 unread messages</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge>New</Badge>
                  <span>John commented on your post</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>New</Badge>
                  <span>Sarah sent you a friend request</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>New</Badge>
                  <span>New product update available</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">
                Mark all as read
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription className="text-primary-50">
                Most popular choice
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-2">
                $29<span className="text-base font-normal">/month</span>
              </div>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>24/7 support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe Now</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Alert Component Showcase
function AlertShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Alert Variants</h2>

        <div className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default alert providing information to the user.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Alert Dialog</h2>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Dialog Component Showcase
function DialogShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Dialog</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a description for the dialog providing additional
                details or context.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>
                Dialog content goes here. This can contain any elements or
                components.
              </p>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Sheet (Side Panel)</h2>

        <div className="flex gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Right Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
                <SheetDescription>
                  This is a sheet dialog that slides in from the side of the
                  screen.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <p>
                  Sheet content here. This is useful for responsive designs and
                  mobile interactions.
                </p>
              </div>
              <SheetFooter>
                <Button>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Left Sheet</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Left Side Sheet</SheetTitle>
                <SheetDescription>
                  This sheet opens from the left side.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <p>Left side sheets are often used for navigation menus.</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

// Form Controls Showcase
function FormsShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Input Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="default-input" className="text-sm font-medium">
              Default Input
            </label>
            <Input id="default-input" placeholder="Type here..." />
          </div>

          <div className="space-y-2">
            <label htmlFor="disabled-input" className="text-sm font-medium">
              Disabled Input
            </label>
            <Input id="disabled-input" disabled placeholder="Disabled input" />
          </div>

          <div className="space-y-2">
            <label htmlFor="input-with-icon" className="text-sm font-medium">
              Input with Icon
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="input-with-icon"
                className="pl-10"
                placeholder="Enter email..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="error-input"
              className="text-sm font-medium text-red-500"
            >
              Error Input
            </label>
            <Input
              id="error-input"
              placeholder="Invalid value"
              className="border-red-500 focus-visible:ring-red-500"
            />
            <p className="text-xs text-red-500">This field is required</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Textarea</h2>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Your Message
          </label>
          <Textarea
            id="message"
            placeholder="Type your message here."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Tabs</h2>
        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account information and preferences.
            </p>
          </TabsContent>
          <TabsContent value="password" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium">Password Settings</h3>
            <p className="text-sm text-gray-500 mt-1">
              Update your password and security settings.
            </p>
          </TabsContent>
          <TabsContent value="settings" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium">General Settings</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage your application preferences.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Navigation Components Showcase
function NavigationShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Tabs Navigation</h2>
        <div className="border rounded-md p-4">
          <NavTabs
            tabs={[
              {
                id: "tab1",
                label: "Dashboard",
                icon: Home,
                content: (
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Dashboard Content</h3>
                    <p className="mt-2">This is the dashboard tab content.</p>
                  </div>
                ),
              },
              {
                id: "tab2",
                label: "Settings",
                icon: Settings,
                content: (
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Settings Content</h3>
                    <p className="mt-2">This is the settings tab content.</p>
                  </div>
                ),
              },
              {
                id: "tab3",
                label: "Users",
                icon: Users,
                content: (
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Users Content</h3>
                    <p className="mt-2">This is the users tab content.</p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// Feedback Components Showcase
function FeedbackShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Tooltips</h2>
        <div className="flex space-x-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover Me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Additional information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Skeleton Loading</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex space-x-4">
            <Skeleton className="h-32 w-32 rounded-md" />
            <Skeleton className="h-32 w-32 rounded-md" />
            <Skeleton className="h-32 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing Calendar component referenced in the code above
function Calendar({ className, ...props }: React.HTMLAttributes<SVGElement>) {
  return <CalendarDays className={className} {...props} />;
}
