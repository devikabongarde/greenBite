import { signIn, signUp } from "@/authService.js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, database, provider } from "@/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNgo = location.state?.isNgo || false; // Determine if signing up as NGO
  const [isLoading, setIsLoading] = useState(false);
  const roles = {
    ADMIN: 'admin',
    NGO: 'ngo',
    USER: 'user',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const result = await signIn(email, password);
      const user = result.user;
      const userRef = ref(database, `${isNgo ? "ngos" : "users"}/${user.uid}`);
      const userData = await get(userRef);
      if (userData.exists()) {
        // Set user data in application state (e.g., using context or state management library)
        // Example: setUser(userData.val());
        toast.success("Logged in successfully");
        setTimeout(() => navigate(isNgo ? "/ngo" : "/dashboard"), 1000);
      } else {
        toast.error("User data not found");
      }
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password);
      const user = result.user;
      const userRef = ref(database, `${isNgo ? "ngos" : "users"}/${user.uid}`);
      await set(userRef, {
        name,
        email: user.email,
        userId: user.uid,
        role: isNgo ? roles.NGO : roles.USER, // Set role based on isNgo
        createdAt: new Date().toISOString(),
      });
      toast.success("Account created successfully");
      navigate(isNgo ? "/ngo" : "/dashboard");
    } catch (err) {
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = ref(database, `${isNgo ? "ngos" : "users"}/${user.uid}`);
      const userData = await get(userRef);
      if (userData.exists()) {
        // Set user data in application state (e.g., using context or state management library)
        // Example: setUser(userData.val());
        toast.success("Logged in with Google successfully");
        navigate(isNgo ? "/ngo" : "/dashboard");
      } else {
        await set(userRef, {
          name: user.displayName,
          email: user.email,
          userId: user.uid,
          role: isNgo ? roles.NGO : roles.USER, // Set role based on isNgo
          createdAt: new Date().toISOString(),
        });
        toast.success("Logged in with Google successfully");
        navigate(isNgo ? "/ngo" : "/dashboard");
      }
    } catch (err) {
      toast.error("Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isNgo ? "NGO Authentication" : "User Authentication"}</CardTitle>
          <CardDescription>
            {isNgo ? "Manage NGO donations and activities." : "Access user features."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Label>Email</Label>
                <Input name="email" type="email" required />
                <Label>Password</Label>
                <Input name="password" type="password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Login"}
                </Button>
                <Button type="button" className="w-full mt-4" onClick={handleGoogleLogin} disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Login with Google"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Label>{isNgo ? "NGO Name" : "Full Name"}</Label>
                <Input name="name" type="text" required />
                <Label>Email</Label>
                <Input name="email" type="email" required />
                <Label>Password</Label>
                <Input name="password" type="password" required />
                <Label>Confirm Password</Label>
                <Input name="confirmPassword" type="password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Sign Up"}
                </Button>
                <Button type="button" className="w-full mt-4" onClick={handleGoogleLogin} disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Sign Up with Google"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default AuthPage;
