"use client";

import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// SearchInput component with icon and input field
const SearchInput = ({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Ask anything about your properties..."
        className="pl-10 pr-24 py-6 text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <AiButton onClick={onSubmit} />
      </div>
    </div>
  );
};

// AiButton component with gradient and sparkles icon
const AiButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      className="bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 transition-all duration-200"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Search
    </Button>
  );
};

// ExampleQuestionList component with clickable questions
const ExampleQuestionList = ({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) => {
  const exampleQuestions = [
    "Which properties have leases expiring next month?",
    "What's my average rental income?",
    "How many vacant properties do I have?",
    "Which tenants are late on payments?",
    "What maintenance requests are pending?",
    "Show properties with highest ROI",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {exampleQuestions.map((question, index) => (
        <div key={index} className="group relative" title={question}>
          <Button
            variant="outline"
            className="justify-start text-left h-auto py-3 px-4 text-sm hover:bg-accent transition-colors w-full"
            onClick={() => onSelect(question)}
          >
            <Search className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-2">{question}</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

// ResultsCard component for displaying AI Insights and Saved Searches
const ResultsCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {title === "AI Insights" && (
            <Sparkles className="mr-2 h-4 w-4 text-primary-500" />
          )}
          {title === "Saved Searches" && (
            <Search className="mr-2 h-4 w-4 text-primary-500" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Main AI Search Page Component
export default function AiSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchPerformed(true);
      // Here you would typically call an API to get results
      console.log("Searching for:", searchQuery);
    }
  };

  const handleExampleSelect = (question: string) => {
    setSearchQuery(question);
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Search</h1>
        <p className="text-gray-500">
          Get instant insights about your properties using natural language
        </p>
      </div>

      {/* Main Search Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
          />
        </CardContent>
      </Card>

      {/* Example Questions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Try asking</h2>
        <ExampleQuestionList onSelect={handleExampleSelect} />
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Insights Card */}
        <ResultsCard title="AI Insights">
          {searchPerformed ? (
            <div className="space-y-4">
              <p>Results for "{searchQuery}"</p>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm">
                  Here's where AI-generated insights would appear based on your
                  query. This placeholder will be replaced with actual data from
                  your API.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Sparkles className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-400">Search to see AI insights</p>
            </div>
          )}
        </ResultsCard>

        {/* Saved Searches Card */}
        <ResultsCard title="Saved Searches">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Properties with expiring leases</p>
                <p className="text-sm text-gray-500">
                  Last searched 2 days ago
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Rental income forecast</p>
                <p className="text-sm text-gray-500">
                  Last searched 1 week ago
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </ResultsCard>
      </div>
    </div>
  );
}
