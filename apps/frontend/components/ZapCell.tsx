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
  name?: string;
  image?: string;
  index: number;
  onClick?: () => void;
}

export const ZapCell: React.FC<ZapCellProps> = ({ name,image, index,onClick }) => {
  return (
    <div onClick={onClick} className={`cursor-pointer flex items-center justify-center bg-slate-400 rounded-lg w-80 h-12 font-semibold gap-4`}>
      {image && <img src={image} className="border-2 rounded w-8 h-8 -ml-4" />}
      <div className="flex items-center gap-2">
        <div>{index}.</div>
        <div>{name}</div>
      </div>
    </div>
  );
};