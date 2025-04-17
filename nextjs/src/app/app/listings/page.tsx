import { MdSell } from "react-icons/md";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ListingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MdSell className="text-3xl text-primary" />
        <h1 className="text-2xl font-semibold">AI Listings</h1>
      </div>

      <p className="text-muted-foreground max-w-2xl">
        Let AI turn your property data into powerful, high-performing listings.
        We crunch your property details, market trends, and platform best
        practices to generate optimized content that attracts more views and
        applications.
      </p>

      <div className="bg-muted p-4 rounded-xl border max-w-2xl">
        <p className="text-sm text-muted-foreground italic">
          💡 Our AI considers location, amenities, market trends, and
          platform-specific keywords to make each listing stand out.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
        {/* Choose purpose */}
        <div>
          <Label className="mb-2 block">Listing Purpose</Label>
          <RadioGroup defaultValue="rent" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="rent" />
              <Label htmlFor="rent">Rent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sell" id="sell" />
              <Label htmlFor="sell">Sell</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Choose platforms */}
        <div>
          <Label className="mb-2 block">List On</Label>
          <div className="space-y-2">
            {["Zillow", "Facebook Marketplace", "Craigslist", "Other"].map(
              (platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox id={platform} />
                  <Label htmlFor={platform}>{platform}</Label>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Link href="/listings/create">
        <Button className="mt-6">Create New Listing</Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map((id) => (
          <Card key={id}>
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-medium">123 Main St, New York</div>
              <p className="text-sm text-muted-foreground">
                AI-generated listing ready to publish
              </p>
              <div className="text-xs text-gray-500">Status: Draft</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
