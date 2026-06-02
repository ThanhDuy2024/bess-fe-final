import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useIntl } from "react-intl";
import { isMobile } from "react-device-detect";

import {
  LuBatteryCharging,
  LuBell,
  LuChartNoAxesCombined,
  LuCpu,
  LuLayoutDashboard,
  LuSettings,
  LuUsers,
  LuGrid2X2,
} from "react-icons/lu";

import { FaUserEdit } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import "./Sidebar.scss";

const menuGroups = [
  {
    labelId: "sidebar_group_overview",
    mobileLabel: "sidebar_group_overview_label",
    mobileIcon: <LuLayoutDashboard />,
    path: "/dashboard",
    items: [
      {
        path: "/dashboard",
        icon: <LuLayoutDashboard />,
        labelId: "sidebar_item_dashboard_overview",
        perm: "view_dashboard",
      },
    ],
  },
  {
    labelId: "sidebar_group_monitoring",
    mobileLabel: "sidebar_group_monitoring_label",
    mobileIcon: <LuCpu />,
    items: [
      {
        path: "/pcs",
        icon: <LuCpu />,
        labelId: "sidebar_item_pcs_detail",
        perm: "view_pcs",
      },
      {
        path: "/battery",
        icon: <LuBatteryCharging />,
        labelId: "sidebar_item_battery_detail",
        perm: "view_battery",
      },
    ],
  },
  {
    labelId: "sidebar_group_operation",
    mobileLabel: "sidebar_group_operation_label",
    mobileIcon: <LuChartNoAxesCombined />,
    items: [
      {
        path: "/energy-report",
        icon: <LuChartNoAxesCombined />,
        labelId: "sidebar_item_energy_report",
        perm: "view_report",
      },
      {
        path: "/alarms",
        icon: <LuBell />,
        labelId: "sidebar_item_alarm_management",
        perm: "view_alarm",
      },
    ],
  },
  {
    labelId: "sidebar_group_management",
    mobileLabel: "sidebar_group_management_label",
    mobileIcon: <LuSettings />,
    items: [
      {
        path: "/users",
        icon: <LuUsers />,
        labelId: "sidebar_item_user_management",
        perm: "manage_users",
      },
      {
        path: "/settings",
        icon: <LuSettings />,
        labelId: "sidebar_item_system_settings",
        perm: "system_settings",
      },
      {
        path: "/user-info",
        icon: <FaUserEdit />,
        labelId: "sidebar_item_user_info",
        perm: "view_user_info",
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const lang = useIntl();
  const { hasPermission } = useAuth();
  const [activeMobileGroup, setActiveMobileGroup] = useState(null);

  if (isMobile) {
    return (
      <>
        {activeMobileGroup !== null && (
          <div
            className="DAT_SidebarMobile_Backdrop"
            onClick={() => setActiveMobileGroup(null)}
          />
        )}

        <div className="DAT_SidebarMobile">
          {menuGroups.map((group, index) => {
            const visibleItems = group.items.filter((item) =>
              hasPermission(item.perm),
            );
            const hasSingleItem = visibleItems.length === 1;

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.labelId} className="DAT_SidebarMobile_Group">
                {!hasSingleItem && activeMobileGroup === index && (
                  <div className="DAT_SidebarMobile_Group_Popup">
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          isActive
                            ? "DAT_SidebarMobile_Group_Popup_Item_Active"
                            : "DAT_SidebarMobile_Group_Popup_Item"
                        }
                        onClick={() => setActiveMobileGroup(null)}
                      >
                        <span className="DAT_SidebarMobile_Group_Popup_Item_Icon">
                          {item.icon}
                        </span>

                        <span className="DAT_SidebarMobile_Group_Popup_Item_Label">
                          {lang.formatMessage({ id: item.labelId })}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )}

                {hasSingleItem ? (
                  <NavLink
                    to={visibleItems[0].path}
                    className={({ isActive }) =>
                      isActive
                        ? "DAT_SidebarMobile_Group_Button_Active"
                        : "DAT_SidebarMobile_Group_Button"
                    }
                    onClick={() => setActiveMobileGroup(null)}
                  >
                    <span className="DAT_SidebarMobile_Group_Button_Icon">
                      {group.mobileIcon}
                    </span>

                    <span className="DAT_SidebarMobile_Group_Button_Label">
                      {lang.formatMessage({id: group.mobileLabel})}
                    </span>
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    className={
                      activeMobileGroup === index
                        ? "DAT_SidebarMobile_Group_Button_Active"
                        : "DAT_SidebarMobile_Group_Button"
                    }
                    onClick={() =>
                      setActiveMobileGroup(
                        activeMobileGroup === index ? null : index,
                      )
                    }
                  >
                    <span className="DAT_SidebarMobile_Group_Button_Icon">
                      {group.mobileIcon}
                    </span>

                    <span className="DAT_SidebarMobile_Group_Button_Label">
                      {lang.formatMessage({id: group.mobileLabel})}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <aside
      className={
        collapsed
          ? "DAT_Sidebar DAT_Sidebar_Collapsed"
          : "DAT_Sidebar"
      }
    >
      <div
        className={
          collapsed
            ? "DAT_Sidebar_Logo DAT_Sidebar_Logo_Collapsed"
            : "DAT_Sidebar_Logo"
        }
        onClick={onToggle}
      >
        <img
          className={
            collapsed
              ? "DAT_Sidebar_Logo_Image_Small"
              : "DAT_Sidebar_Logo_Image_Large"
          }
          src={collapsed ? "/img/logoNho.png" : "/img/logoTo.png"}
          alt="BESS Monitor"
        />
      </div>

      <nav className="DAT_Sidebar_Nav">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasPermission(item.perm),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.labelId} className="DAT_Sidebar_Nav_Group">
              {!collapsed && (
                <div className="DAT_Sidebar_Nav_Group_Label">
                  {lang.formatMessage({ id: group.labelId })}
                </div>
              )}

              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    collapsed
                      ? isActive
                        ? "DAT_Sidebar_Nav_Group_Item_Collapsed_Active"
                        : "DAT_Sidebar_Nav_Group_Item_Collapsed"
                      : isActive
                        ? "DAT_Sidebar_Nav_Group_Item_Active"
                        : "DAT_Sidebar_Nav_Group_Item"
                  }
                  title={
                    collapsed
                      ? lang.formatMessage({ id: item.labelId })
                      : undefined
                  }
                >
                  <span className="DAT_Sidebar_Nav_Group_Item_Icon">
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="DAT_Sidebar_Nav_Group_Item_Label">
                      {lang.formatMessage({ id: item.labelId })}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
