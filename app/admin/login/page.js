import { AuthPage } from '../../../components/auth';
import { AUTH_ROLES } from '../../../lib/auth-config';

export default function AdminLoginPage() {
  return <AuthPage roleConfig={AUTH_ROLES.admin} mode="login" />;
}
