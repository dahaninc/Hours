import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-accent" />
        <span className="text-[15px] font-semibold tracking-tight">Hours</span>
      </Link>
      <AuthForm mode="signup" />
      <p className="mt-8 text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
