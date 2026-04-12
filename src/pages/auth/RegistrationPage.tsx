import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegistrationPage() {
	return (
		<AuthShell title="Create your account" subtitle="Get started in less than a minute.">
			<RegisterForm />
		</AuthShell>
	);
}
