import React, { useState, useEffect } from "react";
import { database } from "../firebaseConfig"; // Your Firebase setup
import { ref, onValue, push, remove } from "firebase/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [newNgo, setNewNgo] = useState("");
  
    useEffect(() => {
      // Fetch Users
      const usersRef = ref(database, "users");
      onValue(usersRef, (snapshot) => {
        const userList = [];
        snapshot.forEach((childSnapshot) => {
          userList.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setUsers(userList);
      });
  
      // Fetch NGOs
      const ngosRef = ref(database, "ngos");
      onValue(ngosRef, (snapshot) => {
        const ngoList = [];
        snapshot.forEach((childSnapshot) => {
          ngoList.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setNgos(ngoList);
      });
    }, []);
    const handleAddNgo = () => {
        if (newNgo.trim() === "") return;
        const ngosRef = ref(database, "ngos");
        push(ngosRef, { name: newNgo });
        setNewNgo("");
      };
      
      const handleDeleteNgo = (ngoId) => {
        const adminPassword = "admin123"; // Static password for now
        const enteredPassword = prompt("Enter Admin Password to delete this NGO:");
      
        if (enteredPassword === adminPassword) {
          const ngoRef = ref(database, `ngos/${ngoId}`);
          remove(ngoRef);
          alert("NGO deleted successfully!");
        } else {
          alert("Incorrect password! Deletion canceled.");
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
        <div className="p-6 space-y-6">
          {/* Dashboard Stats */}
          <div className="flex gap-4">
            <Card className="shadow-lg bg-blue-100 flex-1">
              <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{users.length}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-green-100 flex-1">
              <CardHeader><CardTitle>Total NGOs</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{ngos.length}</p></CardContent>
            </Card>
          </div>
    
          {/* Users Table */}
          <Card>
            <CardHeader><CardTitle>Users List</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.contact}</TableCell>
                      <TableCell>
                        <Badge className={user.isNgo ? "bg-green-600 text-white" : "bg-gray-400 text-black"}>
                          {user.isNgo ? "NGO" : "User"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
    
          {/* NGOs Table */}
          <Card>
            <CardHeader><CardTitle>NGOs List</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NGO Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ngos.map((ngo) => (
                    <TableRow key={ngo.id}>
                      <TableCell>{ngo.name}</TableCell>
                      <TableCell>
                        <Button variant="destructive" onClick={() => handleDeleteNgo(ngo.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
    
          {/* Add NGO Form */}
          <Card>
            <CardHeader><CardTitle>Add New NGO</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input type="text" placeholder="NGO Name" value={newNgo} onChange={(e) => setNewNgo(e.target.value)} />
                <Button onClick={handleAddNgo}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </div>
         </SidebarInset>
            </SidebarProvider>
      );
    };
    export default AdminDashboard;  