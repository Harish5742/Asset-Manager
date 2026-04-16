import { useState } from "wouter";
import { format } from "date-fns";
import { 
  BarChart3, 
  Users, 
  TestTube, 
  Sprout,
  ArrowUpRight,
  Sun,
  Droplets,
  Search
} from "lucide-react";
import {
  useGetSoilStats,
  useListSubmissions,
  getGetSoilStatsQueryKey,
  getListSubmissionsQueryKey
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetSoilStats({
    query: { queryKey: getGetSoilStatsQueryKey() }
  });
  
  const { data: submissionsData, isLoading: submissionsLoading } = useListSubmissions(
    { limit: 20 },
    { query: { queryKey: getListSubmissionsQueryKey({ limit: 20 }) } }
  );

  return (
    <div className="w-full animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all soil analysis submissions across the network.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{stats?.totalSubmissions || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-primary flex items-center gap-2">
                {stats?.todaySubmissions || 0}
                {stats?.todaySubmissions ? (
                  <ArrowUpRight className="h-5 w-5 text-primary opacity-70" />
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average pH Level</CardTitle>
            <TestTube className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-secondary">
                {stats?.avgPh ? stats.avgPh.toFixed(2) : "0.00"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Crop Request</CardTitle>
            <Sprout className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-xl font-bold text-accent-foreground truncate">
                {stats?.topCrops && stats.topCrops.length > 0 
                  ? stats.topCrops[0].crop 
                  : "None yet"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Table Area */}
        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="border-b bg-muted/20 py-4 px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Recent Submissions</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search records..." className="pl-9 bg-background" />
              </div>
            </div>
          </CardHeader>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead className="text-right">pH</TableHead>
                  <TableHead className="text-right">NPK</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : submissionsData?.submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  submissionsData?.submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(sub.createdAt), "MMM d")}
                      </TableCell>
                      <TableCell className="font-medium">{sub.farmerName || "Anonymous"}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-background">
                          {sub.season}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className={sub.ph < 6 || sub.ph > 8 ? "text-destructive font-bold" : "text-primary"}>
                          {sub.ph.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {sub.nitrogen}/{sub.phosphorus}/{sub.potassium}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Sidebar Breakdowns */}
        <div className="flex flex-col gap-6">
          {/* Top Crops */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-md flex items-center gap-2">
                <Sprout className="h-4 w-4 text-primary" />
                Top Recommended Crops
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : stats?.topCrops && stats.topCrops.length > 0 ? (
                <ul className="space-y-4">
                  {stats.topCrops.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">{item.crop}</span>
                      <Badge variant="secondary" className="font-mono">{item.count}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data available yet</p>
              )}
            </CardContent>
          </Card>

          {/* Season Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-md flex items-center gap-2">
                <Sun className="h-4 w-4 text-secondary" />
                Seasonal Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : stats?.seasonBreakdown && stats.seasonBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {stats.seasonBreakdown.map((item, idx) => {
                    const total = stats.totalSubmissions || 1;
                    const percent = Math.round((item.count / total) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-foreground">{item.season}</span>
                          <span className="text-muted-foreground">{percent}% ({item.count})</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data available yet</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
