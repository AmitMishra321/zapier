export const Feature = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="flex pl-8 gap-1 items-center">
      <Check />
      <div className="flex flex-col justify-center gap-2">
        <div className="flex gap-1">
          <div className="font-bold text-sm">{title}</div>

          <div className="text-sm opacity-60">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

function Check() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}
