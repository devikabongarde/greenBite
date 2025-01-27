import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CalendarIcon, PlusCircleIcon, DownloadIcon } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { Separator } from "@/components/ui/separator"
  import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
  import { AppSidebar } from "@/components/ui/app-sidebar"
 

// Sample data (replace with your actual data)
const inventoryTrendsData = [
  { month: 'Jan', Fruits: 400, Vegetables: 240, Dairy: 320, Grains: 280 },
  { month: 'Feb', Fruits: 300, Vegetables: 280, Dairy: 350, Grains: 300 },
  { month: 'Mar', Fruits: 350, Vegetables: 300, Dairy: 380, Grains: 340 },
  { month: 'Apr', Fruits: 280, Vegetables: 260, Dairy: 400, Grains: 360 },
  { month: 'May', Fruits: 320, Vegetables: 290, Dairy: 420, Grains: 380 },
]

const categoryDistributionData = [
  { name: 'Fruits', value: 400 },
  { name: 'Vegetables', value: 300 },
  { name: 'Dairy', value: 300 },
  { name: 'Grains', value: 200 },
]

const statusOverviewData = [
  { status: 'Available', count: 800 },
  { status: 'Low Stock', count: 120 },
  { status: 'Expired', count: 80 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function Dashboard() {
  return (
    <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Personal Food Inventory Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Trends */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
            <CardDescription>Quantity over time for each category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Fruits" stroke="#8884d8" />
                <Line type="monotone" dataKey="Vegetables" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Dairy" stroke="#ffc658" />
                <Line type="monotone" dataKey="Grains" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Proportion of each food category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Count of items by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusOverviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts and Actions */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Alerts and Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CalendarIcon className="h-4 w-4" />
              <AlertTitle>Expiring Soon</AlertTitle>
              <AlertDescription>5 items are expiring within the next 7 days.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Low Stock Alert</AlertTitle>
              <AlertDescription>3 items are running low on stock.</AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button>
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Item
              </Button>
              <Button variant="outline">
                <DownloadIcon className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
        
      </div>
    </SidebarInset>
  </SidebarProvider>
  )
}