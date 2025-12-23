import { useNavigate } from "react-router-dom";
import LoginForm from "../../shared/components/LoginForm";

const LoginKaryawan = () => {
  const navigate = useNavigate();

  // return <LoginForm role="karyawan" onLoginSuccess={() => navigate("/")} />;
  return (
    <LoginForm role="karyawan" onLoginSuccess={() => navigate("/pengumuman")} />
  );
  // <LoginForm role="karyawan" onLoginSuccess={() => navigate("/pengumuman")} />;
};

export default LoginKaryawan;
