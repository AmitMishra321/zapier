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

import { Appbar } from "../../../components/Appbar";
import CustomNode from "../../../components/CustomNode";
interface Action {
  availableActionId: string;
  availableActionName: string;
}
import "@xyflow/react/dist/style.css";
import { ZapCell } from "../../../components/ZapCell";

export type AppNode = BuiltInNode | Node;
export const initialNodes: AppNode[] = [];

export const nodeTypes: NodeTypes = {
  custom: CustomNode,
} satisfies NodeTypes;

export const initialEdges:Edge[] = [];
export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;

// Interface for Action
interface Action {
  availableActionId: string;
  availableActionName: string;
}

const WorkflowPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTrigger, ,] = useState<string>("Trigger");
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);

  const initializeNodes = () => {
    const X = 250;
    const triggerNode: Node = {
      id: "1",
      type: "custom",
      position: { x: X, y: 10 },
      data: { label: <ZapCell name={selectedTrigger} index={1} /> },
    };

    const actionNodes: Node[] = selectedActions.map((action, index) => ({
      id: `${index + 2}`,
      type: "custom",
      position: { x: X, y: (index + 1) * 120 },
      data: {
        label: (
          <ZapCell
            name={action.availableActionName || "Action"}
            index={index + 2}
          />
        ),
      },
    }));

    const addActionButtonNode: Node = {
      id: "add-action-button",
      type: "custom",
      position: { x: X + 132, y: (selectedActions.length + 1) * 120 },
      data: {
        label: (
          <div className="custom-node w-full flex justify-center items-center">
            <Handle type="target" position={Position.Top} id="target" />
            <button
              onClick={() => {
                setSelectedActions((a) => [
                  ...a,
                  {
                    availableActionId: `action-${a.length + 1}`,
                    availableActionName: `Action ${a.length + 1}`,
                  },
                ]);
              }}
            >
              <div className="w-14 p-1">➕</div>
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

      <div className="bg-slate-200 flex justify-start w-full">
        <div style={{ width: "50%", height: "80vh" }} className="bg-zinc-900">
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
              style: { stroke: "white", strokeWidth: 1 },
            }}
            style={{}}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
