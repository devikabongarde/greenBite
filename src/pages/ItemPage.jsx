import { AppSidebar } from "@/components/ui/app-sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { differenceInDays, format } from "date-fns";
import {
  onValue,
  push,
  ref,
  set,
  update,
} from "firebase/database";
import { Calendar as CalendarIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { database } from "../firebaseConfig.js";
import { useRef } from "react";

function ItemPage() {
  const [foodItems, setFoodItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    expiryDate: null,
  });
  const [isUploading, setIsUploading] = useState(false); // To handle loading state during image upload

  // Assuming you have a user authentication system in place, get the current user's ID
  const userId = "userId"; // Replace with dynamic user ID from Firebase Authentication (e.g., `auth.currentUser.uid`)



const alertedItemsRef = useRef(new Set()); // Store already alerted items

useEffect(() => {
  const foodItemsRef = ref(database, `foodItems/${userId}`);
  onValue(foodItemsRef, (snapshot) => {
    const items = [];
    snapshot.forEach((childSnapshot) => {
      const item = { id: childSnapshot.key, ...childSnapshot.val() };
      items.push(item);
    });
    setFoodItems(items);

    // Check for expiring or expired items
    items.forEach((item) => {
      if (item.expiryDate) {
        const daysLeft = differenceInDays(new Date(item.expiryDate), new Date());

        if (!alertedItemsRef.current.has(item.id)) {
          if (daysLeft > 0 && daysLeft <= 7) {
            // Expiring soon
            toast.warn(`⚠️ ${item.name} is expiring in ${daysLeft} days!`, {
              position: "top-center",
              autoClose: 5000,
            });
          } else if (daysLeft < 0) {
            // Already expired
            toast.error(`❌ ${item.name} has expired!`, {
              position: "top-center",
              autoClose: 5000,
            });
          }
          alertedItemsRef.current.add(item.id); // Mark as alerted
        }
      }
    });
  });
}, [userId]);

  

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


  // Handle image upload and expiry date extraction
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to process image");
      }
  
      const data = await response.json();
  
      if (data.expiry_date) {
        const expiryDate = new Date(data.expiry_date);
        setNewItem({ ...newItem, expiryDate });
        toast.success("Expiry date extracted successfully!");
      } else {
        toast.error("No expiry date found in the image.");
      }
    } catch (error) {
      toast.error("Failed to process image: " + error.message);
    } finally {
      setIsUploading(false);
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
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
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
                    <div>
                      <Label htmlFor="imageUpload">Upload Expiry Date Image</Label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      {isUploading && <p className="text-sm text-gray-500">Processing image...</p>}
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