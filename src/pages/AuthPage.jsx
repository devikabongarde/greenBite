import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signUp, signIn, signInWithGoogle } from "@/authService.js";
import { collection, doc, setDoc } from "firebase/firestore"; // Correct import for Firestore
import { useNavigate } from "react-router-dom";
import { db } from "@/firebaseConfig"; // Import the Firestore database reference

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isNgo, setIsNgo] = useState(false); // Track if the user is an NGO

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // Attempt to sign in the user
      const result = await signIn(email, password);
      console.log("Logged in:", result);
      toast.success("Logged in successfully");
      setTimeout(() => navigate(isNgo ? "/" : "/"), 1000);
    } catch (err) {
      console.log("Error:", err);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Check for matching passwords
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password);
      const user = result.user;

      // Correct Firestore usage: Save user data in Firestore
      const userRef = doc(collection(db, isNgo ? "ngos" : "users"), user.uid);
      await setDoc(userRef, {
        email: user.email,
        userId: user.uid,
        isNgo: isNgo, // Save if user is an NGO or not
        createdAt: new Date().toISOString(), // Store a date string
      });

      toast.success("Account created successfully");
      navigate(isNgo ? "/" : "/");
    } catch (err) {
      console.log("Sign up error:", err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else {
        toast.error("Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();

      // Save user data in Firestore
      const userRef = doc(collection(db, user.isNgo ? "ngos" : "users"), user.uid);
      await setDoc(userRef, {
        email: user.email,
        userId: user.uid,
        isNgo: user.isNgo, // Save if user is an NGO or not
        createdAt: new Date().toISOString(),
      });

      toast.success("Logged in with Google successfully");
      navigate(user.isNgo ? "/" : "/");
    } catch (err) {
      console.log("Google sign-in error:", err);
      toast.error("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="devi@abc.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="krsna@foodflux.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                </div>

                {/* NGO Toggle with Switch */}
                <div className="flex items-center space-x-4 mt-4">
                  <Label htmlFor="isNgo" className="text-sm">
                    Sign up as an NGO
                  </Label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isNgo"
                      checked={isNgo}
                      onChange={(e) => setIsNgo(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`w-11 h-6 flex items-center justify-between bg-gray-200 rounded-full p-1 transition-all duration-300 ease-in-out ${
                        isNgo ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                          isNgo ? "translate-x-5" : "translate-x-1"
                        }`}
                      ></span>
                    </span>
                  </label>
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Please wait..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
            >
              Google
            </Button>
          </div>
        </CardContent>
      </Card>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default AuthPage;
