import { AuthPage } from '../../../components/auth';
import { AUTH_ROLES } from '../../../lib/auth-config';

export default function EmployerSignupPage() {
  return <AuthPage roleConfig={AUTH_ROLES.employer} mode="signup" />;
}
