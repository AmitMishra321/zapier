"use client";
import { useRouter } from "next/navigation";
import { Feature } from "./Feature";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { IBM_Plex_Sans } from "next/font/google";
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["600"] });

export const Hero = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div
          className={`text-5xl font-semibold text-center pt-8 max-w-xl ${ibmPlexSans.className}`}
        >
          Automate as fast as you can type
        </div>
      </div>
      <div className="flex justify-center">
        <div className="text-xl font-normal text-gray-600 text-center pt-2 max-w-3xl opacity-75">
          AI gives you automation superpowers, and Zapier puts them to work.
          Pairing AI and Zapier helps you turn ideas into workflows and bots
          that work for you.
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <div className="flex gap-10">
          <PrimaryButton
            onClick={() => {
              router.push("/signup");
            }}
            size="big"
          >
            Get Started free
          </PrimaryButton>
          <div className="">
            <SecondaryButton onClick={() => {}} size="big">
              Contact Sales
            </SecondaryButton>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Feature title={"Free Forever"} subtitle={"for core features"} />
        <Feature title={"More apps"} subtitle={"than any other platforms"} />
        <Feature title={"Cutting Edge"} subtitle={"AI Features"} />
      </div>
    </div>
  );
};
