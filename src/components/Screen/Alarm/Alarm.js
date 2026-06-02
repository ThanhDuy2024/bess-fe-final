import React, { useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuSearch,
  LuBell,
} from "react-icons/lu";
import Modal from "../../Modal/Modal";
import StatusBadge from "../../Modal/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { mockAlarms } from "../../data/mockData";
import "./Alarm.scss";
import { useIntl } from "react-intl";
import { isMobile } from "react-device-detect";
import { AiOutlineDown } from "react-icons/ai";

const normalizeAlarmLevel = (level) => {
  if (level === "Warning" || level === "Info") {
    return "Notice";
  }

  return "Alert";
};

const allowedDevices = ["BMS", "PCS"];

const getAlarmExtraInfo = (alarm) => {
  const voltage = alarm.relatedParams?.voltage || "527.8V";
  const current = alarm.relatedParams?.current || "0.0A";

  if (alarm.device === "BMS") {
    return [
      ["Tầng", "1"],
      ["Cell max (V)", "3.28"],
      ["Cell min (V)", "3.15"],
      ["Rack", "02"],
      ["Nhiệt độ (°C)", "28.5"],
      ["SOC (%)", "85.2"],
      ["DC bus (V)", voltage.replace("V", "")],
      ["Dòng điện (A)", current.replace("A", "")],
      ["SOH (%)", "97.8"],
    ];
  }

  return [
    ["Tầng", "1"],
    ["Input state 1", "49347"],
    ["Input state 2", "1937"],
    ["Output state", "32"],
    ["Tốc độ (mm/s)", "0"],
    ["Vị trí (m)", "0"],
    ["Điện áp DC bus (V)", voltage.replace("V", "")],
    ["Dòng điện (A)", current.replace("A", "")],
    ["Tần số (Hz)", "0"],
  ];
};

const getAlarmCause = (alarm) => {
  if (alarm.device === "BMS") {
    return "Bảo vệ quá nhiệt";
  }

  return "Bảo vệ quá nhiệt";
};

const getAlarmMeasures = (alarm) => {
  if (alarm.device === "BMS") {
    return ["Kiểm tra logic kết nối đầu vào", "Tăng khả năng giải nhiệt motor"];
  }

  return ["Kiểm tra logic kết nối đầu vào", "Tăng khả năng giải nhiệt motor"];
};

export default function Alarm() {
  const lang = useIntl();
  const { hasPermission } = useAuth();
  const [alarms, setAlarms] = useState(
    mockAlarms.filter((alarm) => allowedDevices.includes(alarm.device)),
  );
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterDevice, setFilterDevice] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const perPage = 10;
  const alertLabel = lang.locale === "vi" ? "C\u1ea3nh b\u00e1o" : "Alert";
  const noticeLabel = lang.locale === "vi" ? "Ch\u00fa \u00fd" : "Notice";

  const filtered = alarms.filter((a) => {
    const normalizedLevel = normalizeAlarmLevel(a.level);

    if (filterLevel !== "All" && normalizedLevel !== filterLevel) return false;
    if (filterDevice !== "All" && a.device !== filterDevice) return false;
    if (
      search &&
      !a.message.toLowerCase().includes(search.toLowerCase()) &&
      !a.code.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAck = (id) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "Acknowledged",
              operator: "Admin",
              acknowledgedAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            }
          : a,
      ),
    );
  };

  const handleClear = (id) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "Cleared",
              clearedAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
            }
          : a,
      ),
    );
  };

  return (
    <>
      {isMobile ? (
        <div>
          {" "}
          <div className="DAT_Mobile_Alarm">
            <div className="DAT_Mobile_Alarm_Overview">
              <div className="DAT_Mobile_Alarm_Overview_OverviewTitle">
                <LuBell />
                <div className="DAT_Mobile_Alarm_Overview_OverviewTitle_Text">
                  {lang.formatMessage({ id: "alarms_title" })}
                </div>
              </div>

              <div className="DAT_Mobile_Alarm_Filter">
                {/* Hàng 1: Ô tìm kiếm full width */}
                <div className="DAT_Mobile_Alarm_Filter_Search">
                  <span className="DAT_Mobile_Alarm_Filter_Search_Icon">
                    <LuSearch />
                  </span>
                  <input
                    className="DAT_Mobile_Alarm_Filter_Search_Input"
                    placeholder={lang.formatMessage({ id: "search_alarms" })}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Hàng 2: Nhóm bọc 2 select để đẩy về bên phải */}
                <div className="DAT_Mobile_Alarm_Filter_Form">
                  <select
                    className="DAT_Mobile_Alarm_Filter_Form_Select"
                    value={filterLevel}
                    onChange={(e) => {
                      setFilterLevel(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="All">
                      {lang.formatMessage({ id: "all_levels" })}
                    </option>
                    <option value="Alert">{alertLabel}</option>
                    <option value="Notice">{noticeLabel}</option>
                  </select>

                  <select
                    className="DAT_Mobile_Alarm_Filter_Form_Select"
                    value={filterDevice}
                    onChange={(e) => {
                      setFilterDevice(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="All">
                      {lang.formatMessage({ id: "all_devices" })}
                    </option>
                    {allowedDevices.map((device) => (
                      <option key={device} value={device}>
                        {device}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="DAT_Mobile_Alarm_Main">
              <table className="DAT_Mobile_Alarm_Main_Table">
                <thead>
                  <tr>
                    <th>{lang.formatMessage({ id: "alarm_id" })}</th>
                    <th>{lang.formatMessage({ id: "level" })}</th>
                    <th>{lang.formatMessage({ id: "device" })}</th>
                    <th>{lang.formatMessage({ id: "message" })}</th>
                    <th>{lang.formatMessage({ id: "action" })}</th>
                    <th>{lang.formatMessage({ id: "date" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((a) => (
                    <tr
                      key={a.id}
                      className={
                        normalizeAlarmLevel(a.level) === "Alert"
                          ? "highlight_danger"
                          : "highlight_warning"
                      }
                    >
                      <td className="Font_Medium">{a.code}</td>
                      <td>
                        <StatusBadge status={normalizeAlarmLevel(a.level)} />
                      </td>
                      <td>{a.device}</td>
                      <td>{a.message}</td>
                      <td>
                        <button
                          className="DAT_Mobile_Alarm_Main_Table_View"
                          onClick={() => setSelectedAlarm(a)}
                          aria-label="View alarm detail"
                        >
                          <LuEye />
                        </button>
                        {hasPermission("ack_alarm") &&
                          a.status === "Active" && (
                            <button
                              className="DAT_Mobile_Alarm_Main_Table_Ack"
                              onClick={() => handleAck(a.id)}
                            >
                              {lang.formatMessage({ id: "ack_alarm" })}
                            </button>
                          )}
                        {hasPermission("clear_alarm") &&
                          a.status === "Acknowledged" && (
                            <button
                              className="DAT_Mobile_Alarm_Main_Table_Clear"
                              onClick={() => handleClear(a.id)}
                            >
                              {lang.formatMessage({ id: "clear_alarm" })}
                            </button>
                          )}
                      </td>
                      <td>{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="DAT_Mobile_Alarm_Main_Pagination">
                  <button
                    className="DAT_Mobile_Alarm_Main_Pagination_Btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <LuChevronLeft />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`DAT_Mobile_Alarm_Main_Pagination_Btn ${page === i + 1 ? "active" : ""}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="DAT_Mobile_Alarm_Main_Pagination_Btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                  >
                    <LuChevronRight />
                  </button>
                </div>
              )}
            </div>

            <Modal
              isOpen={!!selectedAlarm}
              onClose={() => setSelectedAlarm(null)}
              title={
                selectedAlarm
                  ? `${lang.formatMessage({ id: "alarm_detail_title" })} ${selectedAlarm.code}`
                  : ""
              }
            >
              {selectedAlarm && (
                <div className="DAT_Mobile_Alarm_Detail">
                  <div className="DAT_Mobile_Alarm_Detail_Device">
                    <span className="DAT_Mobile_Alarm_Detail_Device_Label">
                      Thông tin thiết bị:
                    </span>
                    <span className="DAT_Mobile_Alarm_Detail_Device_Value">
                      {selectedAlarm.device}
                    </span>
                  </div>
                  <div className="DAT_Mobile_Alarm_Detail_Title">
                    Thông tin thêm:
                  </div>
                  <div className="DAT_Mobile_Alarm_Detail_Container">
                    <div className="DAT_Mobile_Alarm_Detail_Grid">
                      {getAlarmExtraInfo(selectedAlarm)
                        .slice(0, 5)
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="DAT_Mobile_Alarm_Detail_Grid_Item"
                          >
                            <span className="DAT_Mobile_Alarm_Detail_Grid_Item_Label">
                              {k}:
                            </span>
                            <span className="DAT_Mobile_Alarm_Detail_Grid_Item_Value">
                              {v}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="DAT_Mobile_Alarm_Detail_Grid">
                      {getAlarmExtraInfo(selectedAlarm)
                        .slice(5)
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="DAT_Mobile_Alarm_Detail_Grid_Item"
                          >
                            <span className="DAT_Mobile_Alarm_Detail_Grid_Item_Label">
                              {k}:
                            </span>
                            <span className="DAT_Mobile_Alarm_Detail_Grid_Item_Value">
                              {v}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="DAT_Mobile_Alarm_Detail_Title">
                    Nguyên nhân:
                  </div>
                  <div className="DAT_Mobile_Alarm_Detail_Box">
                    {getAlarmCause(selectedAlarm)}
                  </div>
                  <div className="DAT_Mobile_Alarm_Detail_Title">
                    Biện pháp:
                  </div>
                  <div className="DAT_Mobile_Alarm_Detail_Box">
                    {getAlarmMeasures(selectedAlarm).map((measure, index) => (
                      <div key={`${selectedAlarm.code}-measure-${index + 1}`}>
                        {measure}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      ) : (
        <div className="DAT_Alarm">
          <div className="DAT_Alarm_Overview">
            <div className="DAT_Alarm_Overview_OverviewTitle">
              <LuBell />
              <div className="DAT_Alarm_Overview_OverviewTitle_Text">
                {lang.formatMessage({ id: "alarms_title" })}
              </div>
            </div>

            <div className="DAT_Alarm_Filter">
              <select
                className="DAT_Alarm_Filter_Form"
                style={{ width: 130 }}
                value={filterLevel}
                onChange={(e) => {
                  setFilterLevel(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">
                  {lang.formatMessage({ id: "all_levels" })}
                </option>
                <option value="Alert">{alertLabel}</option>
                <option value="Notice">{noticeLabel}</option>
              </select>
              <select
                className="DAT_Alarm_Filter_Form"
                style={{ width: 130 }}
                value={filterDevice}
                onChange={(e) => {
                  setFilterDevice(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">
                  {lang.formatMessage({ id: "all_devices" })}
                </option>
                {allowedDevices.map((device) => (
                  <option key={device} value={device}>
                    {device}
                  </option>
                ))}
              </select>
              <div className="DAT_Alarm_Filter_Search" style={{ width: 200 }}>
                <span className="DAT_Alarm_Filter_Search_Icon">
                  <LuSearch />
                </span>
                <input
                  className="DAT_Alarm_Filter_Search_Input"
                  placeholder={lang.formatMessage({ id: "search_alarms" })}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="DAT_Alarm_Main">
            <table className="DAT_Alarm_Main_Table">
              <thead>
                <tr>
                  <th>{lang.formatMessage({ id: "alarm_id" })}</th>
                  <th>{lang.formatMessage({ id: "level" })}</th>
                  <th>{lang.formatMessage({ id: "device" })}</th>
                  <th>{lang.formatMessage({ id: "message" })}</th>
                  <th>{lang.formatMessage({ id: "action" })}</th>
                  <th>{lang.formatMessage({ id: "date" })}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => (
                  <tr
                    key={a.id}
                    className={
                      normalizeAlarmLevel(a.level) === "Alert"
                        ? "highlight_danger"
                        : "highlight_warning"
                    }
                  >
                    <td className="Font_Medium">{a.code}</td>
                    <td>
                      <StatusBadge status={normalizeAlarmLevel(a.level)} />
                    </td>
                    <td>{a.device}</td>
                    <td>{a.message}</td>
                    <td>
                      <button
                        className="DAT_Alarm_Main_Table_View"
                        onClick={() => setSelectedAlarm(a)}
                        aria-label="View alarm detail"
                      >
                        <LuEye />
                      </button>
                      {hasPermission("ack_alarm") && a.status === "Active" && (
                        <button
                          className="DAT_Alarm_Main_Table_Ack"
                          onClick={() => handleAck(a.id)}
                        >
                          {lang.formatMessage({ id: "ack_alarm" })}
                        </button>
                      )}
                      {hasPermission("clear_alarm") &&
                        a.status === "Acknowledged" && (
                          <button
                            className="DAT_Alarm_Main_Table_Clear"
                            onClick={() => handleClear(a.id)}
                          >
                            {lang.formatMessage({ id: "clear_alarm" })}
                          </button>
                        )}
                    </td>
                    <td>{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="DAT_Alarm_Main_Pagination">
                <button
                  className="DAT_Alarm_Main_Pagination_Btn"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Previous page"
                >
                  <LuChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`DAT_Alarm_Main_Pagination_Btn ${page === i + 1 ? "active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="DAT_Alarm_Main_Pagination_Btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  aria-label="Next page"
                >
                  <LuChevronRight />
                </button>
              </div>
            )}
          </div>

          <Modal
            isOpen={!!selectedAlarm}
            onClose={() => setSelectedAlarm(null)}
            title={
              selectedAlarm
                ? `${lang.formatMessage({ id: "alarm_detail_title" })} ${selectedAlarm.code}`
                : ""
            }
          >
            {selectedAlarm && (
              <div className="DAT_Alarm_Detail">
                <div className="DAT_Alarm_Detail_Device">
                  <span className="DAT_Alarm_Detail_Device_Label">
                    Thông tin thiết bị:
                  </span>
                  <span className="DAT_Alarm_Detail_Device_Value">
                    {selectedAlarm.device}
                  </span>
                </div>
                <div className="DAT_Alarm_Detail_Title">Thông tin thêm:</div>
                <div className="DAT_Alarm_Detail_Grid">
                  {getAlarmExtraInfo(selectedAlarm).map(([k, v]) => (
                    <div key={k} className="DAT_Alarm_Detail_Grid_Item">
                      <span className="DAT_Alarm_Detail_Grid_Item_Label">
                        {k}:
                      </span>
                      <span className="DAT_Alarm_Detail_Grid_Item_Value">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="DAT_Alarm_Detail_Title">Nguyên nhân:</div>
                <div className="DAT_Alarm_Detail_Box">
                  {getAlarmCause(selectedAlarm)}
                </div>
                <div className="DAT_Alarm_Detail_Title">Biện pháp:</div>
                <div className="DAT_Alarm_Detail_Box">
                  {getAlarmMeasures(selectedAlarm).map((measure, index) => (
                    <div key={`${selectedAlarm.code}-measure-${index + 1}`}>
                      {measure}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
}
