import React from 'react';
import { NavLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  LuBatteryCharging,
  LuBell,
  LuChartNoAxesCombined,
  LuCpu,
  LuLayoutDashboard,
  LuSettings,
  LuUsers,
  LuUserPen
} from 'react-icons/lu';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.scss';

const SIDEBAR_CLASS = 'DAT_Sidebar';
const SIDEBAR_LOGO_CLASS = `${SIDEBAR_CLASS}_Logo`;
const SIDEBAR_LOGO_IMAGE_CLASS = `${SIDEBAR_LOGO_CLASS}_Image`;
const SIDEBAR_NAV_CLASS = `${SIDEBAR_CLASS}_Nav`;
const SIDEBAR_GROUP_CLASS = `${SIDEBAR_NAV_CLASS}_Group`;
const SIDEBAR_ITEM_CLASS = `${SIDEBAR_GROUP_CLASS}_Item`;

const menuGroups = [
  {
    labelId: "sidebar_group_overview",
    items: [
      { path: '/dashboard', icon: <LuLayoutDashboard />, labelId: "sidebar_item_dashboard_overview", perm: 'view_dashboard' },
    ],
  },
  {
    labelId: "sidebar_group_monitoring",
    items: [
      { path: '/pcs', icon: <LuCpu />, labelId: "sidebar_item_pcs_detail", perm: 'view_pcs' },
      { path: '/battery', icon: <LuBatteryCharging />, labelId: "sidebar_item_battery_detail", perm: 'view_battery' },
    ],
  },
  {
    labelId: "sidebar_group_operation",
    items: [
      { path: '/energy-report', icon: <LuChartNoAxesCombined />, labelId: "sidebar_item_energy_report", perm: 'view_report' },
      { path: '/alarms', icon: <LuBell />, labelId: "sidebar_item_alarm_management", perm: 'view_alarm' },
    ],
  },
  {
    labelId: "sidebar_group_management",
    items: [
      { path: '/users', icon: <LuUsers />, labelId: "sidebar_item_user_management", perm: 'manage_users' },
      { path: '/settings', icon: <LuSettings />, labelId: "sidebar_item_system_settings", perm: 'system_settings' },
      // { path: '/roles', icon: <RiFolderSettingsFill />, labelId: "sidebar_item_role_management", perm: 'manage_roles' },
      { path: '/user-info', icon: <LuUserPen />, labelId: "sidebar_item_user_info", perm: 'view_user_info' }

    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const lang = useIntl();
  const { hasPermission } = useAuth();

  return (
    <aside className={collapsed ? `${SIDEBAR_CLASS} ${SIDEBAR_CLASS}_Collapsed` : SIDEBAR_CLASS}>
      <div
        className={
          collapsed
            ? `${SIDEBAR_LOGO_CLASS} ${SIDEBAR_LOGO_CLASS}_Collapsed`
            : SIDEBAR_LOGO_CLASS
        }
        onClick={onToggle}
      >
        <img
          className={
            collapsed
              ? `${SIDEBAR_LOGO_IMAGE_CLASS}_Small`
              : `${SIDEBAR_LOGO_IMAGE_CLASS}_Large`
          }
          src={collapsed ? "/img/logoNho.png" : "/img/logoTo.png"}
          alt="BESS Monitor"
        />
      </div>
      <nav className={SIDEBAR_NAV_CLASS}>
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasPermission(item.perm));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.labelId} className={SIDEBAR_GROUP_CLASS}>
              {!collapsed && (
                <div className={`${SIDEBAR_GROUP_CLASS}_Label`}>
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
                        ? `${SIDEBAR_ITEM_CLASS}_Collapsed_Active`
                        : `${SIDEBAR_ITEM_CLASS}_Collapsed`
                      : isActive
                        ? `${SIDEBAR_ITEM_CLASS}_Active`
                        : SIDEBAR_ITEM_CLASS
                  }
                  title={collapsed ? lang.formatMessage({ id: item.labelId }) : undefined}
                >
                  <span className={`${SIDEBAR_ITEM_CLASS}_Icon`}>{item.icon}</span>
                  {!collapsed && (
                    <span className={`${SIDEBAR_ITEM_CLASS}_Label`}>
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
