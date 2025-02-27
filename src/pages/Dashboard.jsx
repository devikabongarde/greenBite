import { useEffect, useState, useRef } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { differenceInDays, format } from "date-fns";
import { onValue, push, ref, set, update } from "firebase/database";
import { database } from "../firebaseConfig.js";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function DashboardPage() {
  const [foodItems, setFoodItems] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const userId = "userId";

  useEffect(() => {
    const foodItemsRef = ref(database, `foodItems/${userId}`);
    onValue(foodItemsRef, (snapshot) => {
      const items = [];
      const alerts = [];
      snapshot.forEach((childSnapshot) => {
        const item = { id: childSnapshot.key, ...childSnapshot.val() };
        items.push(item);
        if (item.expiryDate) {
          const daysLeft = differenceInDays(new Date(item.expiryDate), new Date());
          if (daysLeft > 0 && daysLeft <= 7) {
            alerts.push({ message: `${item.name} is expiring in ${daysLeft} days!`, type: "warning" });
          } else if (daysLeft < 0) {
            alerts.push({ message: `${item.name} has expired!`, type: "error" });
          }
        }
      });
      setFoodItems(items);
      setExpiryAlerts(alerts);
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
      <SidebarInset>
    <div className="flex">
      
      <AppSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
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
       

        {/* Expiring Soon & Expired Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expiring Soon & Expired Items</CardTitle>
          </CardHeader>
          <CardContent>
            {expiryAlerts.length > 0 ? (
              <ul className="list-disc pl-6 space-y-2">
                {expiryAlerts.map((alert, index) => (
                  <li key={index} className={`text-${alert.type === "error" ? "red" : "yellow"}-600`}>
                    {alert.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No expiring soon or expired items.</p>
            )}
          </CardContent>
        </Card>

        {/* Food Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Food Inventory</CardTitle>
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
                    <TableCell>
                      {item.expiryDate ? format(new Date(item.expiryDate), "PPP") : "No Date"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={differenceInDays(new Date(item.expiryDate), new Date()) < 0 ? "destructive" : "default"}>
                        {differenceInDays(new Date(item.expiryDate), new Date()) < 0 ? "Expired" : "Fresh"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  </SidebarInset>
  </SidebarProvider>
  );
}

export default DashboardPage;
