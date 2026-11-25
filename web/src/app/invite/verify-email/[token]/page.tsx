import { VerifyInvitationEmail } from "@/components/invitations/VerifyInvitationEmail";

export default async function VerifyInvitationEmailTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <VerifyInvitationEmail initialToken={token} />;
}
