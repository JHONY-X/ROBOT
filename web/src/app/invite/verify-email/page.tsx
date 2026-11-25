import { VerifyInvitationEmail } from "@/components/invitations/VerifyInvitationEmail";

export default async function VerifyInvitationEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <VerifyInvitationEmail initialToken={token ?? ""} />;
}
