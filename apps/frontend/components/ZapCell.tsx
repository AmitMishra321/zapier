// export const ZapCell = ({ name, index }: { name: string; index: number }) => {
//   return (
//     <div className="flex items-center justify-center bg-slate-400 rounded-lg w-1/4 h-14 font-bold gap-2">
//       <div>{index}.</div>
//       <div>{name}</div>
//     </div>
//   );
// };



// ZapCell Component
import React from "react";

interface ZapCellProps {
  name: string;
  index: number;
}

export const ZapCell: React.FC<ZapCellProps> = ({ name, index }) => {
  return (
    <div className="flex items-center justify-center bg-slate-400 rounded-lg w-80 h-12 font-semibold gap-2">
      <div>{index}.</div>
      <div>{name}</div>
    </div>
  );
};