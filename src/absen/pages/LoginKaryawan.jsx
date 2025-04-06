import { useNavigate } from "react-router-dom";
import LoginForm from "../../shared/components/LoginForm";

const LoginKaryawan = () => {
  const navigate = useNavigate();

  return <LoginForm role="karyawan" onLoginSuccess={() => navigate("/")} />;
};

export default LoginKaryawan;
