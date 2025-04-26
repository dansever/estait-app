"use client";

import React, { useState } from "react";
import { Search, Sparkles, Eye, History, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSubmittedQuery(query);
    setTimeout(() => setIsLoading(false), 1500); // simulate delay
  };

  const presetQuestions = [
    "Which properties are currently vacant?",
    "Show my highest paying tenants",
    "What’s the total rental income this year?",
    "What documents are missing per property?",
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI Search</h1>
        <p className="text-gray-500 text-sm">
          Ask anything about your properties and get smart insights instantly.
        </p>
      </header>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="E.g. What are the top 3 most profitable units?"
              className="pl-10 pr-28 py-6 text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {presetQuestions.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => {
                  setQuery(q);
                  handleSearch();
                }}
                className="justify-start text-left h-auto py-3 px-4 text-sm"
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                {q}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submittedQuery ? (
              isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Showing results for:{" "}
                    <span className="font-medium text-gray-800">
                      "{submittedQuery}"
                    </span>
                  </p>
                  <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
                    This is where AI-generated answers will appear once
                    connected to your backend.
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-400">
                <Eye className="h-10 w-10 mb-2" />
                Ask a question to get insights
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Properties with expiring leases</p>
            <p>Top maintenance costs by building</p>
            <p>Monthly income breakdown</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
