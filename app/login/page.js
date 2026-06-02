import { AuthPage } from '../../components/auth';
import { AUTH_ROLES } from '../../lib/auth-config';

export default function JobSeekerLoginPage() {
  return <AuthPage roleConfig={AUTH_ROLES.jobSeeker} mode="login" />;
}
