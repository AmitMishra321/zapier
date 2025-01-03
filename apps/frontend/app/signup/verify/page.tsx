"use client";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Appbar } from "../../../components/Appbar";
import { PrimaryButton } from "../../../components/buttons/PrimaryButton";
import { BACKEND_URL } from "../../config";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      axios
        .get(`${BACKEND_URL}/api/v1/user/verify-email?token=${token}`)
        .then((res) => {
          if (res.data.verified) {
            setStatus("Your email has been successfully verified!");
            setIsVerified(true);
          } else {
            setStatus("Verification failed. Please try again.");
          }
        })
        .catch(() => setStatus("Verification failed. Please try again."));
    } else {
      setStatus("Invalid verification link.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Appbar />
      <div className="flex min-h-80 items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-lg shadow-lg border-2">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Email Verification
          </h2>
          <p className={`text-center text-sm ${isVerified ? "text-green-600" : "text-gray-600"}`}>
            {status}
          </p>
          {isVerified && (
            <div className="flex justify-center">
              <PrimaryButton onClick={() => router.push("/login")}>
                Go to Login
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
