import AuthGuard from "../../components/auth/AuthGuard.jsx";

export default function LoginLayout({ children }) {
  // Login page should NOT have AuthGuard - allows access without authentication
  return <>{children}</>;
}
