"use client";
import { useRouter } from "next/navigation"
import { LinkButton } from "./buttons/LinkButton"
import { PrimaryButton } from "./buttons/PrimaryButton";

export const Appbar = () => {
    const router = useRouter();
    return <div className="flex items-center border-b justify-between p-4">
        <div className="flex flex-col justify-center text-2xl font-extrabold">
            Zapier
        </div>
        <div className="flex items-center gap-1">
            <div className="">
                <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
            </div>
            <div className="pr-2">
                <LinkButton onClick={() => {
                    router.push("/login")
                }}>Login</LinkButton>
            </div>
            <PrimaryButton onClick={() => {
                router.push("/signup")
            }}>
                Signup
            </PrimaryButton>            
        </div>
    </div>
}