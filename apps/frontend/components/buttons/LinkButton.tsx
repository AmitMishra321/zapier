"use client";

import { ReactNode } from "react";

export const LinkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex justify-center px-4 py-2 cursor-pointer hover:bg-slate-100 font-light hover:font-normal text-sm rounded-full"
      onClick={onClick}
    >
      {children}
    </div>
  );
};
