"use client";
import { ReactElement, useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  BackgroundVariant,
} from "@xyflow/react";
import type {
  Connection,
  Edge,
  EdgeTypes,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { Appbar } from "@/components/Appbar";
import CustomNode from "@/components/CustomNode";
interface Action {
  availableActionId: string;
  availableActionName: string;
}
import "@xyflow/react/dist/style.css";
import { ZapCell } from "@/components/ZapCell";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { DarkButton } from "@/components/buttons/DarkButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Input } from "@/components/Input";
import { toast } from "react-toastify";

export type AppNode = BuiltInNode | Node;
export const initialNodes: AppNode[] = [];

export const nodeTypes: NodeTypes = {
  custom: CustomNode,
} satisfies NodeTypes;

export const initialEdges: Edge[] = [];
export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;


type EndPoint = "trigger" | "action";
interface Trigger {
  id: string;
  name: string;
  image: string;
}

interface Action {
  id: string;
  name: string;
  image: string;
}

type AvailableItem = Trigger | Action;

function useAvailableItems(endpoint: EndPoint) {
  const [items, setItems] = useState<AvailableItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchItems = async () => {
      setError(null);

      const responseKey =
        endpoint === "trigger" ? "availableTriggers" : "availableActions";

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authorization token is missing");
        }

        const response = await axios.get(`${BACKEND_URL}/api/v1/${endpoint}/available`, {
          headers: {
            Authorization: token,
          },
          signal: controller.signal,
        });

        setItems(response.data[responseKey] || []);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log(`Request for ${endpoint} canceled.`);
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      }
    };

    fetchItems();

    return () => {
      controller.abort();
    };
  }, [endpoint]);

  console.log(error)

  return { items };
}


const WorkflowPage: React.FC = () => {
  const router = useRouter();
  const { items: availableTriggers } = useAvailableItems("trigger");
  const { items: availableActions } = useAvailableItems("action");
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const initializeNodes = () => {
    const X = 250; // Horizontal position
    const paddingTop = 50; // Padding from the top
    const nodeHeight = 120; // Distance between nodes
  
    // Trigger Node
    const triggerNode: Node = {
      id: "1",
      type: "custom",
      position: { x: X, y: paddingTop },
      data: {
        label: (
          <ZapCell
            onClick={() => setSelectedModalIndex(1)}
            image={selectedTrigger?.image}
            name={selectedTrigger?.name || "Trigger"}
            index={1}
          />
        ),
      },
    };
  
    // Action Nodes
    const actionNodes: Node[] = selectedActions.map((action, index) => ({
      id: `${index + 2}`,
      type: "custom",
      position: { x: X, y: paddingTop + (index + 1) * nodeHeight },
      data: {
        label: (
          <ZapCell
            key={index}
            onClick={() => setSelectedModalIndex(action.index)}
            image={action?.image}
            name={action.availableActionName || "Action"}
            index={action.index}
          />
        ),
      },
    }));
  
    // Add Action Button Node
    const addActionButtonNode: Node = {
      id: "add-action-button",
      type: "custom",
      position: {
        x: X + 132,
        y: paddingTop + (selectedActions.length + 1) * nodeHeight,
      },
      data: {
        label: (
          <div className="custom-node w-full flex justify-center items-center">
            <Handle type="target" position={Position.Top} id="target" />
            <button
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
              <div className="w-14 p-1 bg-slate-300 rounded-md">➕</div>
            </button>
            <Handle type="source" position={Position.Bottom} id="source" />
          </div>
        ),
      },
    };
  
    const newEdges: Edge[] = actionNodes.map((node, index) => ({
      id: `edge-${index + 1}`,
      source: index === 0 ? "1" : `${index + 1}`,
      target: node.id,
      animated: true,
    }));

    const addBtnEdges: Edge[] = [
      {
        id: `edge-add-btn`,
        source: `${selectedActions.length + 1}`,
        target: "add-action-button",
        animated: true,
      },
    ];

    setNodes([triggerNode, ...actionNodes, addActionButtonNode]);
    setEdges([...newEdges, ...addBtnEdges]);
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  useEffect(() => {
    initializeNodes();
  }, [selectedTrigger, selectedActions]);

  return (
    <div className="w-full min-h-screen">
      <Appbar />
      <div className="bg-slate-200 w-full relative">
        {/* added publish button */}
        <div className="w-fit h-fit absolute top-0 right-0 p-2">
          <DarkButton size="big" onClick={handlePublish}>
            Publish
          </DarkButton>
        </div>
        <div className="bg-slate-700 flex justify-center w-full">
          <div style={{ width: "50%", height: "90vh" }} className="bg-slate-700">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView={false}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              fitViewOptions={{
                padding: 0,
                includeHiddenNodes: false,
                minZoom: 0.1,
                maxZoom: 0.5,
              }}
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: "#666", strokeWidth: 2 },
              }}
              style={{}}
            >
              <Background color="#000" lineWidth={.2} variant={BackgroundVariant.Cross} />
              <Controls />
            </ReactFlow>
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
    </div>
  );
};

export default WorkflowPage;




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
