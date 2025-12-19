"use client";

import { GoogleIcon } from "../icons";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import LoginForm from "./login-form";
import SignUpForm from "./sign-up-form";
import { Separator } from "@radix-ui/react-dropdown-menu";

const AuthCard = () => {
  const [activeTab, setActiveTab] = useState("sign-in");

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <Card className="w-full lg:max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="sign-in"
              className="transition-all duration-200"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="sign-up"
              className="transition-all duration-200"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="sign-in"
            className="animate-in fade-in-50 slide-in-from-left-10 duration-500"
          >
            <div className="space-y-4">
              <LoginForm />
            </div>
          </TabsContent>

          <TabsContent
            value="sign-up"
            className="animate-in fade-in-50 slide-in-from-right-10 duration-500"
          >
            <div className="space-y-4">
              <SignUpForm />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="w-full flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-center">
          <Separator className="bg-muted-foreground h-px w-full" />
          <div className="w-full text-muted-foreground text-center">Or continue with</div>
          <Separator className="bg-muted-foreground h-px w-full" />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleSignIn}
          className="w-full font-medium h-11 rounded-lg"
        >
          Sign in with Google
          <GoogleIcon />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthCard;
