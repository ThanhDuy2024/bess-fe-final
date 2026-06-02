import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuBell, LuLogOut } from "react-icons/lu";
import { FaEarthAsia } from "react-icons/fa6";
import { useIntl } from "react-intl";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../Lang/LanguageProvider";
import "./Header.scss";

export default function Header() {
  const lang = useIntl();
  const { setLocale } = useLanguage();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showLanMenu, setShowLanMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleChangeLanguage = (nextLang) => {
    setLocale(nextLang);
    setShowLanMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="DAT_Header">
      <div className="DAT_Header_left">
        <h1 className="DAT_Header_left_title">
          {lang.formatMessage({ id: "bess" })}
        </h1>
      </div>
      <div className="DAT_Header_right">
        <div className="DAT_Header_right_dropdown">
          <button
            type="button"
            className="DAT_Header_right_iconButton"
            onClick={() => setShowLanMenu(!showLanMenu)}
            aria-label={lang.formatMessage({ id: "common_select_language" })}
          >
            <FaEarthAsia />
          </button>
          {showLanMenu && (
            <div className="DAT_Header_right_dropdown_menu DAT_Header_right_dropdown_menu_language">
              <div
                className="DAT_Header_right_dropdown_menuItem"
                onClick={() => handleChangeLanguage("vi")}
              >
                {lang.formatMessage({ id: "language_vi" })}
              </div>
              <div
                className="DAT_Header_right_dropdown_menuItem"
                onClick={() => handleChangeLanguage("en")}
              >
                {lang.formatMessage({ id: "language_en" })}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="DAT_Header_right_iconButton"
          onClick={() => navigate("/alarms")}
          aria-label={lang.formatMessage({ id: "common_open_alarms" })}
        >
          <LuBell />
          <span className="DAT_Header_right_iconButton_badge">3</span>
        </button>

        <div className="DAT_Header_right_dropdown">
          <button
            type="button"
            className="DAT_Header_right_user"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="DAT_Header_right_user_avatar">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div className="DAT_Header_right_user_info">
              <span className="DAT_Header_right_user_info_name">
                {currentUser?.name}
              </span>
              <span className="DAT_Header_right_user_info_role">
                {currentUser?.role}
              </span>
            </div>
          </button>
          {showUserMenu && (
            <div className="DAT_Header_right_dropdown_menu DAT_Header_right_dropdown_menu_user">
              <div
                className="DAT_Header_right_dropdown_menuItem"
                onClick={handleLogout}
              >
                <LuLogOut />
                {lang.formatMessage({ id: "common_logout" })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
