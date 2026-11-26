import { AccountSettings } from "@/components/account/AccountSettings";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function EmployerAccountSettingsPage() {
  return (
    <DashboardLayout role="employer">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Account settings</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your account profile and password.</p>
        </header>
        <AccountSettings />
      </div>
    </DashboardLayout>
  );
}
