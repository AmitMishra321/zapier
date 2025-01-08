"use client";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
import { toast } from "react-toastify";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const token = searchParams.get("token");
    const u_id = searchParams.get("id");
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/user/reset-password`,
        { token, id: u_id, password }
      );
      toast.success(res.data.message);
      router.push("/login")
    } catch (error) {
      toast.error("Failed to forget password. Please try again.");
      console.error("Error updating password:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Appbar />
      <div className="flex justify-center">
        <div className="flex pt-8 max-w-4xl">
          <div className="flex-1 pt-16 px-4">
            <div className="font-semibold text-3xl pb-4">
              Join millions worldwide who automate their work using Zapier.
            </div>
            <div className="pb-6 pt-4">
              <CheckFeature label={"Easy setup, no coding required"} />
            </div>
            <div className="pb-6">
              <CheckFeature label={"Free forever for core features"} />
            </div>
            <CheckFeature label={"14-day trial of premium features & apps"} />
          </div>
          <div className="flex-1 pt-6 pb-6 mt-14 px-4 border rounded">
            <Input
              onChange={(e) => setPassword(e.target.value)}
              label={"Password"}
              type="password"
              placeholder="Password"
            />
            <div className="pt-4">
              <PrimaryButton onClick={handleSubmit} size="big">
                Update Password
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
