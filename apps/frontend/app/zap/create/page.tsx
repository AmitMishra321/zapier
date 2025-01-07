"use client";
import { useEffect, useState } from "react";
import { Appbar } from "@/components/Appbar";
import { ZapCell } from "@/components/ZapCell";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import { useRouter } from "next/navigation";
import { DarkButton } from "@/components/buttons/DarkButton";
import { Input } from "@/components/Input";

type EndPoint = "trigger" | "action";

function useAvailableItems(endpoint: EndPoint) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const responseKey =
      endpoint === "trigger" ? "availableTriggers" : "availableActions";

    axios
      .get(`${BACKEND_URL}/api/v1/${endpoint}/available`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => setItems(res.data[responseKey]))
      .catch((error) => console.error(`Error fetching ${endpoint}:`, error));
  }, [endpoint]);

  return items;
}

export default function () {
  const router = useRouter();
  const availableTriggers = useAvailableItems("trigger");
  const availableActions = useAvailableItems("action");
  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
    image?: string;
  }>();
  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      image?: string;
      availableActionId: string;
      availableActionName: string;
      metadata: any;
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<number | null>(
    null
  );

  const handlePublish = async () => {
    if (!selectedTrigger?.id) {
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/zap`,
        {
          availableTriggerId: selectedTrigger.id,
          triggerMetadata: {},
          actions: selectedActions.map((a) => ({
            availableActionId: a.availableActionId,
            actionMetadata: a.metadata,
          })),
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Error publishing zap:", error);
    }
  };

  return (
    <div>
      <div className="">
        <Appbar />
      </div>

      <div className="bg-slate-200 w-full relative">
        {/* added publish button */}
        <div className="w-fit h-fit absolute top-0 right-0 p-4">
          <DarkButton size="big" onClick={handlePublish}>Publish</DarkButton>
        </div>

        <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center gap-4">
          <div className=" flex justify-center items-center">
            <ZapCell
              onClick={() => setSelectedModalIndex(1)}
              image={selectedTrigger?.image}
              name={selectedTrigger?.name || "Trigger"}
              index={1}
            />
          </div>
          <div className=" flex justify-center items-center flex-col gap-4">
            {selectedActions.map((action, index) => (
              <ZapCell
                key={index}
                onClick={() => setSelectedModalIndex(action.index)}
                image={action?.image}
                name={action.availableActionName || "Action"}
                index={action.index}
              />
            ))}
          </div>
          <div className="flex justify-center items-center">
            <SecondaryButton
              onClick={() => {
                setSelectedActions((a) => [
                  ...a,
                  {
                    index: a.length + 2,
                    availableActionId: "",
                    availableActionName: "",
                    metadata: {},
                  },
                ]);
              }}
            >
              <div className="w-fit">➕</div>
            </SecondaryButton>
          </div>
        </div>
        {selectedModalIndex && (
          <Modal
            availableItems={
              selectedModalIndex === 1 ? availableTriggers : availableActions
            }
            onSelect={(
              props: null | {
                id: string;
                name: string;
                image?: string;
                metadata: any;
              }
            ) => {
              if (props === null) {
                setSelectedModalIndex(null);
                return;
              }
              if (selectedModalIndex === 1) {
                setSelectedTrigger({
                  id: props.id,
                  name: props.name,
                  image: props.image,
                });
              } else {
                setSelectedActions((a) => {
                  let newActions = [...a];
                  newActions[selectedModalIndex - 2] = {
                    index: selectedModalIndex,
                    image: props.image,
                    availableActionId: props.id,
                    availableActionName: props.name,
                    metadata: props.metadata,
                  };
                  return newActions;
                });
              }
              setSelectedModalIndex(null);
            }}
            index={selectedModalIndex}
          />
        )}
      </div>
    </div>
  );
}

function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (
    props: null | { id: string; name: string; image?: string; metadata: any }
  ) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    name: string;
    image?: string;
  }>();
  const isTrigger = index === 1;
  return (
    <div className="fixed top-0 right-0 left-0 z-50 justify-center items-start w-full md:inset-0 h-[calc(100%)] max-h-full bg-neutral-900 bg-opacity-80 flex">
      <div className="relative p-4 w-full max-w-lg max-h-full mt-20">
        <div className="relative bg-white rounded-lg shadow ">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
            <div className="text-lg font-semibold">
              Select {index === 1 ? "Trigger" : "Action"}
            </div>
            <button
              onClick={() => {
                onSelect(null);
              }}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="default-modal"
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="p-4 md:p-5 space-y-4">
            {step === 1 && selectedAction?.id && (
              <ItemSelector
                id={selectedAction.id}
                setMetadata={(metadata) => {
                  onSelect({ ...selectedAction, metadata });
                }}
              />
            )}

            {step === 0 && (
              <div>
                {availableItems.map(({ id, name, image }) => {
                  return (
                    <div
                      key={id}
                      onClick={() => {
                        if (isTrigger) {
                          onSelect({
                            id,
                            name,
                            image,
                            metadata: {},
                          });
                        } else {
                          setStep(1);
                          setSelectedAction({
                            id,
                            name,
                            image,
                          });
                        }
                      }}
                      className="flex items-center border p-2 cursor-pointer hover:bg-slate-100 gap-4"
                    >
                      <img src={image} className="border-2 rounded w-8 h-8" />
                      <div className="flex items-center font-semibold">
                        {name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemSelector({
  id,
  setMetadata,
}: {
  id: string;
  setMetadata: (params: any) => void;
}) {
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  return (
    <>
      {id === "email" && (
        <>
          <Input
            type="text"
            label={"To"}
            placeholder={"To"}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="text"
            label={"Body"}
            placeholder={"Body"}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="pt-2">
            <SecondaryButton
              onClick={() => {
                setMetadata({
                  email,
                  body,
                });
              }}
            >
              submit
            </SecondaryButton>
          </div>
        </>
      )}

      {id === "sol" && (
        <>
          <Input
            type="text"
            label={"Address"}
            placeholder={"Address"}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            type="text"
            label={"Amount"}
            placeholder={"Amount"}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="pt-2">
            <SecondaryButton
              onClick={() => {
                setMetadata({
                  amount,
                  address,
                });
              }}
            >
              submit
            </SecondaryButton>
          </div>
        </>
      )}
    </>
  );
}
