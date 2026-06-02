import React, { useMemo, useState, useEffect } from "react";
import Modal from "../../Modal/Modal";
import StatusBadge from "../../Modal/StatusBadge";
import "./UserManagement.scss";
import { useIntl } from "react-intl";
import { LuUsers } from "react-icons/lu";
import { callApi } from "../../Api/Api";

const emptyUser = {
  name: "",
  userName: "",
  email: "",
  password: "",
  role: "engineer",
  status: "active",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [form, setForm] = useState(emptyUser);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const lang = useIntl();
  const normalizeValue = (value) => String(value || "").trim().toLowerCase();

  const loadUser = async () => {
    let res = await callApi(
      "post",
      process.env.REACT_APP_APIDEV + "/data/getAllUser",
      {},
    );

    if (res.status === true) {
      const list = res.data.map((item) => ({
        id: item._id,
        name: item._name,
        userName: item._username,
        email: item._email,
        role: normalizeValue(item._role),
        status: normalizeValue(item._status),
        lastLogin: item._lastlogin,
        created: item._createdat,
      }));

      setUsers(list);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        if (
          role !== "All" &&
          normalizeValue(user.role) !== normalizeValue(role)
        ) {
          return false;
        }
        if (
          status !== "All" &&
          normalizeValue(user.status) !== normalizeValue(status)
        ) {
          return false;
        }
        if (search) {
          const keyword = search.toLowerCase();
          return (
            user.name.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword) ||
            String(user.userName).toLowerCase().includes(keyword)
          );
        }
        return true;
      }),
    [role, status, search, users],
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyUser);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ ...emptyUser, ...user, password: "" });
    setShowModal(true);
  };

  const saveUser = async () => {
    if (!form.name || !form.userName || !form.email) return;

    let res = await callApi(
      "post",
      process.env.REACT_APP_APIDEV + "/data/updateUser",
      {
        action: editing ? "update" : "insert",
        id: editing ? editing.id : 0,
        name: form.name,
        username: form.userName,
        email: form.email,
        password: form.password || "",
        role: form.role.toLowerCase(),
        status: form.status.toLowerCase(),
      },
    );

    if (res.status) {
      setShowModal(false);
      loadUser();
    } else {
      alert(res.mes);
    }
  };

  return (
    <div className="DAT_UserManagement">
      <div className="DAT_UserManagement_Card">
        <div className="DAT_UserManagement_Card_Info">
          <div className="DAT_UserManagement_Card_Info_Icon">
            <LuUsers size={25} />
          </div>
          <div className="DAT_UserManagement_Card_Info_Title">
            {lang.formatMessage({ id: "user_management" })}
          </div>
        </div>
        <div className="DAT_UserManagement_Card_Actions">
          <input
            className="DAT_UserManagement_Card_Actions_FilterInput"
            style={{ width: 220 }}
            placeholder={lang.formatMessage({ id: "user_search" })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="DAT_UserManagement_Card_Actions_FilterSelect"
            style={{ width: 140 }}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="All">
              {lang.formatMessage({ id: "all_role" })}
            </option>
            <option value="admin">
              {lang.formatMessage({ id: "admin_role" })}
            </option>
            <option value="engineer">
              {lang.formatMessage({ id: "engineer_role" })}
            </option>
          </select>
          <select
            className="DAT_UserManagement_Card_Actions_FilterSelect"
            style={{ width: 140 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">
              {lang.formatMessage({ id: "all_status_role" })}
            </option>
            <option value="active">
              {lang.formatMessage({ id: "statusActive_role" })}
            </option>
            <option value="locked">
              {lang.formatMessage({ id: "statusLocked_role" })}
            </option>
          </select>
          <button
            className="DAT_UserManagement_Card_Actions_Button_Primary"
            onClick={openNew}
          >
            {lang.formatMessage({ id: "add_user" })}
          </button>
        </div>
      </div>

      <div className="DAT_UserManagement_Container">
        <div className="DAT_UserManagement_Container_Table">
          <table className="DAT_UserManagement_Container_Table_Main">
            <thead>
              <tr>
                <th>{lang.formatMessage({ id: "user_id_table" })}</th>
                <th>{lang.formatMessage({ id: "user_name_table" })}</th>
                <th>Username</th>
                <th>{lang.formatMessage({ id: "user_email_table" })}</th>
                <th>{lang.formatMessage({ id: "user_role_table" })}</th>
                <th>{lang.formatMessage({ id: "user_status_table" })}</th>
                <th>{lang.formatMessage({ id: "user_last_login_table" })}</th>
                <th>{lang.formatMessage({ id: "user_create_at_table" })}</th>
                <th>{lang.formatMessage({ id: "user_action_table" })}</th>
              </tr>
            </thead>
            <tbody className="DAT_UserManagement_Container_Table_Main_Body">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="DAT_UserManagement_Container_Table_Main_Row"
                >
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    USR-{String(user.id).padStart(3, "0")}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    {user.name}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    {user.userName}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    {user.email}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    {user.role}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    {user.created
                      ? new Date(user.created).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td className="DAT_UserManagement_Container_Table_Main_Cell">
                    <div className="DAT_UserManagement_Container_Table_Actions">
                      <button
                        className="DAT_UserManagement_Container_Table_Actions_Button_GhostSm"
                        onClick={() => openEdit(user)}
                      >
                        {lang.formatMessage({ id: "user_edit_button" })}
                      </button>
                      <button
                        className="DAT_UserManagement_Container_Table_Actions_Button_SecondarySm"
                        onClick={async () => {
                          let res = await callApi(
                            "post",
                            process.env.REACT_APP_APIDEV + "/data/updateUser",
                            {
                              action: "lock",
                              id: user.id,
                              name: "",
                              username: "",
                              email: "",
                              password: "",
                              role: "",
                              status:
                                user.status === "locked" ? "active" : "locked",
                            },
                          );

                          if (res.status) {
                            loadUser();
                          } else {
                            alert(res.mes);
                          }
                        }}
                      >
                        {normalizeValue(user.status) === "locked"
                          ? lang.formatMessage({ id: "user_unlock_button" })
                          : lang.formatMessage({ id: "user_locked_button" })}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editing
            ? lang.formatMessage({ id: "user_modal_edit_title" })
            : lang.formatMessage({ id: "user_modal_add_title" })
        }
        footer={
          <>
            <button
              className="DAT_UserManagement_Modal_Footer_Button_Secondary"
              onClick={() => setShowModal(false)}
            >
              {lang.formatMessage({ id: "modal_cancel" })}
            </button>
            <button
              className="DAT_UserManagement_Modal_Footer_Button_Primary"
              onClick={saveUser}
            >
              {lang.formatMessage({ id: "user_modal_save_user" })}
            </button>
          </>
        }
      >
        <div className="DAT_UserManagement_Form_Grid">
          <div className="DAT_UserManagement_Form_Grid_Group">
            <label className="DAT_UserManagement_Form_Grid_Group_Label">
              {lang.formatMessage({ id: "user_modal_full_name" })}
            </label>
            <input
              className="DAT_UserManagement_Form_Grid_Group_Input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="DAT_UserManagement_Form_Grid_Group">
            <label className="DAT_UserManagement_Form_Grid_Group_Label">
              {lang.formatMessage({ id: "user_modal_email" })}
            </label>
            <input
              className="DAT_UserManagement_Form_Grid_Group_Input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="DAT_UserManagement_Form_Grid_Group">
            <label className="DAT_UserManagement_Form_Grid_Group_Label">
              {lang.formatMessage({ id: "user_modal_password" })}
            </label>
            <input
              className="DAT_UserManagement_Form_Grid_Group_Input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="DAT_UserManagement_Form_Grid_Group">
            <label className="DAT_UserManagement_Form_Grid_Group_Label">
              Username
            </label>
            <input
              className="DAT_UserManagement_Form_Grid_Group_Input"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
            />
          </div>
          <div className="DAT_UserManagement_Form_Grid_Group">
            <label className="DAT_UserManagement_Form_Grid_Group_Label">
              {lang.formatMessage({ id: "user_modal_role" })}
            </label>
            <select
              className="DAT_UserManagement_Form_Grid_Group_Select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>
          <div className="DAT_UserManagement_Form_Grid_Group">
            <label className="DAT_UserManagement_Form_Grid_Group_Label">
              {lang.formatMessage({ id: "user_modal_status" })}
            </label>
            <select
              className="DAT_UserManagement_Form_Grid_Group_Select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
