import { useNavigate } from "react-router-dom";
import LoginForm from "../../shared/components/LoginForm";

const LoginAdmin = () => {
  const navigate = useNavigate();

  return (
    <LoginForm role="admin" onLoginSuccess={() => navigate("/dashboard")} />
  );
};

export default LoginAdmin;
