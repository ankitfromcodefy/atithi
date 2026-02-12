"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

function Dashboard() {
  const searchParams = useSearchParams();
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    if (searchParams.get("gmail") === "connected") {
      setGmailConnected(true);
      toast.success("Gmail connected successfully!");
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const handleConnectGmail = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-lg px-6">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Atithi
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Email Integration</CardTitle>
            <CardDescription>
              Connect your Gmail account to start receiving guest emails.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gmailConnected ? (
              <Button variant="outline" disabled className="w-full">
                <CheckCircle className="text-green-500" />
                Gmail Connected
              </Button>
            ) : (
              <Button onClick={handleConnectGmail} className="w-full">
                <Mail />
                Connect Gmail
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
