import { AuthPage } from '../../../components/auth';
import { AUTH_ROLES } from '../../../lib/auth-config';

export default function EmployerLoginPage() {
  return <AuthPage roleConfig={AUTH_ROLES.employer} mode="login" />;
}
