"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";
import {
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  Users,
  Home,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Types moved to the top for better organization
interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  description: string;
}

interface ChartPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AnalyticsTab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

// Component for the summary metric cards with enhanced design
const MetricCard = ({
  title,
  value,
  trend,
  trendValue,
  description,
}: MetricCardProps) => {
  const isPositive = trend === "up";
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="@container/card">
      <CardHeader className="relative pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {title}
        </CardTitle>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <div className="absolute right-4 top-4">
          <Badge
            variant="outline"
            className="flex gap-1 rounded-lg text-xs"
            aria-label={`Trend: ${isPositive ? "Up" : "Down"} by ${trendValue}`}
          >
            <TrendIcon className="size-3" />
            {isPositive ? `+${trendValue}` : `-${trendValue}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0 text-sm">
        <div className="line-clamp-1 flex items-center gap-2 font-medium">
          {isPositive ? "Trending up" : "Trending down"}
          {isPositive ? (
            <TrendingUp className="size-4" />
          ) : (
            <TrendingUp className="size-4 rotate-180" />
          )}
        </div>
        <div className="text-muted-foreground text-xs mt-1">{description}</div>
      </CardContent>
    </Card>
  );
};

// Chart placeholder component
const ChartPlaceholder = ({
  title,
  description,
  icon: Icon,
}: ChartPlaceholderProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Icon className="h-5 w-5 mr-2" /> {title}
        </CardTitle>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="aspect-[16/9] bg-gray-100 rounded-md flex flex-col items-center justify-center">
          <Icon className="h-16 w-16 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            Chart visualization will appear here
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Connect your data source to see actual metrics
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Using our shadcn Tabs component instead of custom implementation
const AnalyticsTabs = ({ tabs }: { tabs: AnalyticsTab[] }) => {
  return (
    <Tabs defaultValue={tabs[0].id} className="w-full">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center"
          >
            {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default function AnalyticsPage() {
  const analyticsTabs: AnalyticsTab[] = [
    {
      id: "revenue",
      label: "Revenue",
      icon: LineChart,
      content: (
        <div className="space-y-6">
          <ChartPlaceholder
            title="Revenue Overview"
            description="Monthly revenue breakdown and forecasts"
            icon={LineChart}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartPlaceholder
              title="Revenue Sources"
              description="Revenue breakdown by property type"
              icon={PieChart}
            />
            <ChartPlaceholder
              title="Revenue Trends"
              description="Year-over-year comparison"
              icon={TrendingUp}
            />
          </div>
        </div>
      ),
    },
    {
      id: "occupancy",
      label: "Occupancy",
      icon: Home,
      content: (
        <div className="space-y-6">
          <ChartPlaceholder
            title="Occupancy Rate"
            description="Property occupancy over time"
            icon={Home}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartPlaceholder
              title="Vacancy Analysis"
              description="Factors affecting vacancy rates"
              icon={Users}
            />
            <ChartPlaceholder
              title="Tenant Turnover"
              description="Tenant retention and turnover rates"
              icon={Calendar}
            />
          </div>
        </div>
      ),
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <ChartPlaceholder
            title="Expense Breakdown"
            description="Categorized expense analysis"
            icon={PieChart}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartPlaceholder
              title="Maintenance Costs"
              description="Property maintenance expenditures"
              icon={BarChart}
            />
            <ChartPlaceholder
              title="Operating Expenses"
              description="Monthly operating cost trends"
              icon={LineChart}
            />
          </div>
        </div>
      ),
    },
    {
      id: "roi",
      label: "ROI",
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <ChartPlaceholder
            title="Return on Investment"
            description="ROI performance across properties"
            icon={TrendingUp}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartPlaceholder
              title="Appreciation"
              description="Property value appreciation rates"
              icon={LineChart}
            />
            <ChartPlaceholder
              title="Cash Flow"
              description="Monthly cash flow analysis"
              icon={BarChart}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Revenue"
          value="$42,350"
          trend="up"
          trendValue="12.5%"
          description="Performance vs. last quarter (+8.2%)"
        />
        <MetricCard
          title="Occupancy Rate"
          value="92.4%"
          trend="up"
          trendValue="3.2%"
          description="Strong tenant retention this period"
        />
        <MetricCard
          title="Avg. Expense"
          value="$12,720"
          trend="down"
          trendValue="5.1%"
          description="Cost optimization effective"
        />
        <MetricCard
          title="ROI"
          value="8.7%"
          trend="up"
          trendValue="0.5%"
          description="Exceeds market average by 1.2%"
        />
      </div>

      {/* Tab Navigation using shadcn Tabs */}
      <AnalyticsTabs tabs={analyticsTabs} />

      {/* Additional Content - Data Refresh Note */}
      <div className="mt-8 text-sm text-gray-500 flex justify-end items-center">
        <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
        <span>Data last updated: April 16, 2025</span>
      </div>
    </div>
  );
}
