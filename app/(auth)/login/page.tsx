import OtpForm from "@/components/auth/OtpForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <OtpForm mode="login" oauthError={error} />;
}