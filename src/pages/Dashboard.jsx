import { AppSidebar } from "@/components/ui/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../firebaseConfig.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function DashboardPage() {
  const [foodItems, setFoodItems] = useState([]);
  const userId = "userId"; // Replace with dynamic user ID

  useEffect(() => {
    const foodItemsRef = ref(database, `foodItems/${userId}`);
    onValue(foodItemsRef, (snapshot) => {
      const items = [];
      snapshot.forEach((childSnapshot) => {
        const item = { id: childSnapshot.key, ...childSnapshot.val() };
        items.push(item);
      });
      setFoodItems(items);
    });
  }, [userId]);

  const totalItems = foodItems.length;
  const expiringSoon = foodItems.filter(item => item.expiryDate && new Date(item.expiryDate) - new Date() <= 7 * 24 * 60 * 60 * 1000).length;
  const expired = foodItems.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length;

  const chartData = [
    { name: "Total Items", value: totalItems },
    { name: "Expiring Soon", value: expiringSoon },
    { name: "Expired", value: expired }
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </header>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Total Food Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-yellow-100">
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{expiringSoon}</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-red-100">
            <CardHeader>
              <CardTitle>Expired Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{expired}</p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Food Inventory Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.expiryDate || "No Date"}</TableCell>
                      <TableCell>{
                        new Date(item.expiryDate) < new Date()
                          ? "Expired"
                          : new Date(item.expiryDate) - new Date() <= 7 * 24 * 60 * 60 * 1000
                          ? "Expiring Soon"
                          : "Fresh"
                      }</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardPage;
