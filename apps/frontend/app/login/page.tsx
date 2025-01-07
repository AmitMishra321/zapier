"use client";
import { Appbar } from "@/components/Appbar";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [verifyMsg, setVerifyMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginBtn = async () => {
    setIsLoading(true); // Set loading state to true
    setVerifyMsg(""); // Clear previous messages
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        username: email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        router.push("/dashboard");
      }
    } catch (error:any) {
      toast.error(error.response.data.message)
      if (axios.isAxiosError(error) && error.response) {
        setVerifyMsg(error.response.data.message || "Login failed.");
      } else {
        setVerifyMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div>
      <Appbar />
      {/* {verifyMsg && (
        <div className="pt-4 flex justify-center text-red-500">{verifyMsg}</div>
      )} */}
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
              onChange={(e) => setEmail(e.target.value)}
              label={"Email"}
              type="text"
              placeholder="Your Email"
            />
            <Input
              onChange={(e) => setPassword(e.target.value)}
              label={"Password"}
              type="password"
              placeholder="Password"
            />
            <div className="pt-4">
              <PrimaryButton
                onClick={handleLoginBtn}
                size="big"
              >
                {isLoading ? "Logging in..." : "Login"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













