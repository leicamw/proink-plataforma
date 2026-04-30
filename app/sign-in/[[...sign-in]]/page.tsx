import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Pro <span className="text-[#22c55e]">Ink</span>
        </h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">Entre na sua conta</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            card: "bg-[#111111] border border-white/[0.08] shadow-2xl",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            header: "hidden",
            socialButtonsBlockButton:
              "bg-[#1a1a1a] border border-white/[0.08] text-white hover:bg-[#222222]",
            formButtonPrimary:
              "bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium",
            footerActionLink: "text-[#22c55e] hover:text-[#16a34a]",
            formFieldInput:
              "bg-[#1a1a1a] border-white/[0.08] text-white placeholder:text-[#666]",
            formFieldLabel: "text-[#a3a3a3]",
            dividerLine: "bg-white/[0.08]",
            dividerText: "text-[#a3a3a3]",
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}
