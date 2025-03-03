import { useEffect, useState } from "react";
import { database, auth } from "../firebaseConfig";
import { ref, onValue, update } from "firebase/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

function NGOPage() {
  const [donations, setDonations] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const donationsRef = ref(database, `ngos/${userId}/donations`);
    onValue(donationsRef, (snapshot) => {
      const items = [];
      snapshot.forEach((childSnapshot) => {
        const item = { id: childSnapshot.key, ...childSnapshot.val() };
        items.push(item);
      });
      setDonations(items);
    });
  }, [userId]);

  const handleAccept = (donationId) => {
    update(ref(database, `ngos/${userId}/donations/${donationId}`), {
      status: "Accepted"
    })
      .then(() => {
        toast.success("Donation accepted!");
      })
      .catch((error) => {
        toast.error("Failed to accept donation: " + error.message);
      });
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
                  <BreadcrumbLink href="#">NGO Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Donation Requests</h1>
          <ToastContainer position="top-center" />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Donor ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.itemName}</TableCell>
                  <TableCell>{donation.donorId}</TableCell>
                  <TableCell>
                    <Badge variant={donation.status === "Accepted" ? "success" : "warning"}>
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {donation.status !== "Accepted" && (
                      <Button onClick={() => handleAccept(donation.id)}>
                        Accept
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default NGOPage; 
