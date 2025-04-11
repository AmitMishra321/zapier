import { ReactNode } from "react";

export const SecondaryButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
}) => {
  return (
    <div
      onClick={onClick}
      className={`${size === "small" ? "text-sm" : "text-xl"} ${size === "small" ? "px-6 py-2" : "px-16 py-4"} cursor-pointer hover:shadow-md border text-black border-black rounded-full flex justify-center items-center`}
    >
      {children}
    </div>
  );
};
