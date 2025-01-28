import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig" // Updated import to use Firestore
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ItemPage() {
  const [foodItems, setFoodItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    expiryDate: "",
  });
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (!userId) return; // Ensure user is logged in
    const foodItemsQuery = query(
      collection(db, "foodItems"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(foodItemsQuery, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFoodItems(items);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [userId]);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return "unknown";
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 7) return "expiring-soon";
    return "fresh";
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }
    if (!newItem.name || !newItem.quantity || !newItem.expiryDate) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "foodItems"), {
        userId,
        ...newItem,
        expiryDate: newItem.expiryDate.toISOString(),
        quantity: parseInt(newItem.quantity, 10),
      });
      toast.success("Food item added successfully!");
      setNewItem({ name: "", quantity: "", expiryDate: "" });
    } catch (error) {
      toast.error("Failed to add food item: " + error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }
    try {
      await deleteDoc(doc(db, "foodItems", itemId));
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete item: " + error.message);
    }
  };

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
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Items</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <ToastContainer position="top-center" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="container mx-auto px-4 py-8 ">
            <h1 className="text-3xl font-bold mb-6">Food Inventory Manager</h1>

            <Card className="mb-8 max-w-xl">
              <CardHeader>
                <CardTitle>Add New Food Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="max-w-2xl">
                    <Label htmlFor="itemName">Food Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      placeholder="Enter food item name"
                    />
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({ ...newItem, quantity: e.target.value })
                      }
                      placeholder="Number of items"
                    />
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !newItem.expiryDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newItem.expiryDate
                            ? format(newItem.expiryDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newItem.expiryDate}
                          onSelect={(date) =>
                            setNewItem({ ...newItem, expiryDate: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button type="submit" className="w-full">
                    Add Food Item
                  </Button>
                </form>
              </CardContent>
            </Card>

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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foodItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.expiryDate
                            ? format(new Date(item.expiryDate), "PPP")
                            : "No Date"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getExpiryStatus(item.expiryDate)}>
                            {getExpiryStatus(item.expiryDate)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            className="hover:bg-red-200 hover:text-white"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="text-red-600" />
                          </Button>
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

export default ItemPage;
