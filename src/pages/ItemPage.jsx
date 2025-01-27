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
import { Calendar as CalendarIcon, Trash2, Bell, BellOff } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
} from "firebase/database";
import { database } from "../firebaseConfig.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ItemPage() {
  const [foodItems, setFoodItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    expiryDate: "",
  });
  
  // Assuming you have a user authentication system in place, get the current user's ID
  const userId = "userId"; // Replace with dynamic user ID from Firebase Authentication (e.g., `auth.currentUser.uid`)

  useEffect(() => {
    const foodItemsRef = ref(database, `foodItems/${userId}`);
    onValue(foodItemsRef, (snapshot) => {
      const items = [];
      snapshot.forEach((childSnapshot) => {
        items.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setFoodItems(items);
    });
  }, [userId]); // Use `userId` as a dependency to update the data when the user changes

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return "unknown";
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 7) return "expiring-soon";
    return "fresh";
  };

  const toggleAlert = (itemId, currentStatus) => {
    const itemRef = ref(database, `foodItems/${userId}/${itemId}`);
    update(itemRef, { alertEnabled: !currentStatus });
  };

  // Handle adding a new food item to Firebase
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity || !newItem.expiryDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const foodItemsRef = ref(database, `foodItems/${userId}`);
    const newFoodItemRef = push(foodItemsRef);
    const foodItem = { ...newItem };
    foodItem.expiryDate = format(newItem.expiryDate, "yyyy/MM/dd");
    foodItem.quantity = parseInt(newItem.quantity);

    set(newFoodItemRef, foodItem)
      .then(() => {
        toast.success("Food item added successfully!");
        setNewItem({
          name: "",
          quantity: "",
          expiryDate: null,
        });
      })
      .catch((error) => {
        toast.error("Failed to add food item: " + error.message);
      });
  };

  // Handle deleting an item from Firebase
  const handleDeleteItem = (itemId) => {
    const itemRef = ref(database, `foodItems/${userId}/${itemId}`);
    set(itemRef, null);
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
                  <div className=" max-w-2xl">
                    <div>
                      <Label htmlFor="itemName">Food Item Name</Label>
                      <Input
                        id="itemName"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        placeholder="Enter food item name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({ ...newItem, quantity: e.target.value })
                        }
                        placeholder="Number of items"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!newItem.expiryDate && "text-muted-foreground"
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
                      <TableHead>quantity</TableHead>
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
