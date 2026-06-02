import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff, LuGlobe, LuLock, LuUser } from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(7, 15, 32, 0.28), rgba(7, 15, 32, 0.42)), url(${process.env.PUBLIC_URL}/intro.jpg)`,
  };

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Vui long nhap ten tai khoan.");
      return;
    }

    if (!password) {
      setError("Vui long nhap mat khau.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(identifier, password, remember);
      setLoading(false);

      if (result.success) {
        navigate("/dashboard");
        return;
      }

      setError(result.error);
    }, 300);
  };

  const handleForgotPassword = () => {
    window.alert("Vui long lien he quan tri vien de duoc cap lai mat khau.");
  };

  const handleDemoLogin = () => {
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = login("admin", "admin123", true);
      setLoading(false);

      if (result.success) {
        navigate("/dashboard");
        return;
      }

      setError(result.error);
    }, 200);
  };

  return (
    <div className="DAT_Login" style={backgroundStyle}>
      <div className="DAT_Login_Overlay"></div>

      <div className="DAT_Login_Card">
        <div className="DAT_Login_Card_Inner">
          <div className="DAT_Login_Card_Header">
            <h1>Đăng nhập</h1>
            <button
              type="button"
              className="DAT_Login_Card_Header_Language"
              aria-label="Ngon ngu tieng Viet"
            >
              <LuGlobe />
              <span>Vi</span>
            </button>
          </div>

          <form className="DAT_Login_Card_Form" onSubmit={handleSubmit}>
            <div className="DAT_Login_Card_Form_Field">
              <span className="DAT_Login_Card_Form_Field_Icon">
                <LuUser />
              </span>
              <input
                type="text"
                placeholder="Ten tai khoan"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoFocus
              />
            </div>

            <div className="DAT_Login_Card_Form_Field">
              <span className="DAT_Login_Card_Form_Field_Icon">
                <LuLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mat khau"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="DAT_Login_Card_Form_Field_Action"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Hien hoac an mat khau"
              >
                {showPassword ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>

            <label className="DAT_Login_Card_Form_Remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Lưu đăng nhập</span>
            </label>

            {error && <div className="DAT_Login_Card_Form_Error">{error}</div>}

            <button
              type="submit"
              className="DAT_Login_Card_Form_Submit"
              disabled={loading}
            >
              {loading ? "Dang dang nhap" : "Dang nhap"}
            </button>

            <div className="DAT_Login_Card_Form_Links">
              <button type="button" onClick={handleForgotPassword}>
                Quên mật khẩu
              </button>
            </div>

            <button
              type="button"
              className="DAT_Login_Card_Form_Demo"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Tài khoản trải nghiệm
            </button>
          </form>
        </div>
      </div>

      <div className="DAT_Login_Footer">
        <span>Phiên bản: 1.1</span>
        <span>BESS</span>
      </div>
    </div>
  );
}
