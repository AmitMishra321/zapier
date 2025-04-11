"use client";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
import { toast } from "react-toastify";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const [isVerified, setIsVerified] = useState(false);
  const [reEmail, setReEmail] = useState({ token: "", id: "" });

  useEffect(() => {
    const token = searchParams.get("token");
    const u_id = searchParams.get("id");

    if (token && u_id) {
      setReEmail({ token, id: u_id });
    }

    if (token) {
      axios
        .get(
          `${BACKEND_URL}/api/v1/user/verify-email?id=${u_id}&token=${token}`,
        )
        .then((res) => {
          if (res.data.verified) {
            toast.success("Your email has been successfully verified!");
            setStatus("Your email has been successfully verified!");
            setIsVerified(true);
            router.push("/login");
          } else {
            setStatus("Verification failed. Please try again.");
          }
        })
        .catch(() => setStatus("Verification failed. Please try again."));
    } else {
      setStatus("Invalid verification link.");
      toast.error("Invalid verification link.");
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (reEmail.token && reEmail.id) {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/user/resend-email-verification?id=${reEmail.id}&token=${reEmail.token}`,
        );
        toast.success(res.data.message);
      } catch (error) {
        toast.error("Failed to resend verification email. Please try again.");
        console.error("Error resending email:", error);
      }
    } else {
      toast.error("Invalid email verification details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Appbar />
      <div className="flex min-h-80 items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-lg shadow-lg border-2">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Email Verification
          </h2>
          <p
            className={`text-center text-sm ${
              isVerified ? "text-green-600" : "text-gray-600"
            }`}
          >
            {status}
          </p>
          {reEmail.token && reEmail.id && (
            <div className="flex justify-center">
              <PrimaryButton onClick={handleResendEmail}>
                Resend Verification Email
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
