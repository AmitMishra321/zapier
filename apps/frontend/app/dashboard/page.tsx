"use client";
import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "@/app/config";
import { LinkButton } from "@/components/buttons/LinkButton";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

interface ApiResponse {
  zaps: Zap[];
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchZaps = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authorization token is missing");
        }

        const response = await axios.get<ApiResponse>(`${BACKEND_URL}/api/v1/zap`, {
          headers: {
            Authorization: token,
          },
          signal: controller.signal,
        });

        setZaps(response.data.zaps);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled");
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchZaps();

    return () => {
      controller.abort(); // Cleanup: cancel request on component unmount
    };
  }, []);

  return {
    loading,
    zaps,
    error,
  };
}

export default function () {
  const { loading, zaps ,error} = useZaps();
  const router = useRouter();
  useEffect(() => {
    toast.error(error)
  }, [error])
  
  return (
    <div>
      <Appbar />
      <div className="flex justify-center pt-8">
        <div className="max-w-screen-lg	w-full px-8">
          <div className="flex justify-between">
            <div className="cursor-pointer text-2xl font-bold">My Zaps</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
              }}
            >
              Create
            </DarkButton>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center mt-20">Loading...</div>
      ) : (
        <div className="flex justify-center mt-4">
          {" "}
          <ZapTable zaps={zaps} />{" "}
        </div>
      )}
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  return (
    <div className="max-w-screen-lg w-11/12">
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-md">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-center text-gray-600 font-semibold">
              <th className="p-4">Name</th>
              <th className="p-4">ID</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Webhook URL</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {zaps.map((z, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 transition duration-200"
              >
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                  {z.trigger.type.image ? (
                    <img
                      src={z.trigger.type.image}
                      alt="Trigger Icon"
                      className="w-8 h-8 rounded border-2"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded border-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="orange"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                        />
                      </svg>
                    </div>
                  )}

                  {z.actions.map((x, idx) =>
                    x.type.image ? (
                      <img
                        key={idx}
                        src={x.type.image}
                        alt="Action Icon"
                        className="w-8 h-8 rounded border-2"
                      />
                    ) : (
                      <div
                        key={idx}
                        className="w-8 h-8 bg-gray-200 flex items-center justify-center rounded border-2"
                      >
                        🎬
                      </div>
                    )
                  )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-wrap max-w-[200px]">{z.id}</div>
                </td>
                <td className="p-4 text-nowrap text-center">Jan 01, 2025</td>
                <td className="p-4 w-1/3">
                  <div className="text-wrap text-center">{`${HOOKS_URL}/hooks/catch/${z.userId}/${z.id}`}</div>
                </td>
                <td className="p-2 text-center">
                  <LinkButton
                    onClick={() => {
                      // router.push("/zap/" + z.id);
                    }}
                  >
                    Go
                  </LinkButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
