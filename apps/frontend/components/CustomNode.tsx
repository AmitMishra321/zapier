import React from "react";
import { Handle, Position } from "@xyflow/react";

interface CustomNodeProps {
  data: { label: React.ReactNode };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => (
  <div className="custom-node w-full">
    <Handle type="target" position={Position.Top} id="target" />
    <div
      style={{
        border: "1px dashed #999",
        padding: "2px",
        borderRadius: "10px",
        // backgroundColor: "#fff",
      }}
    >
      {data.label}
    </div>
    <Handle type="source" position={Position.Bottom} id="source" />
  </div>
);

export default CustomNode;
