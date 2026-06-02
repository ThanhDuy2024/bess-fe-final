import React, { use, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import StatusBadge from "../../Modal/StatusBadge";
import { mockSystemSummary as sys } from "../../data/mockData";
import { convertToDoublewordAndFloat } from "../../../App";


export const formatPower = (value) => {
  // Kiểm tra tính hợp lệ của đầu vào

  // Dùng Math.abs để xử lý đúng cả trường hợp số âm (nếu có công suất âm)
  const absValue = Math.abs(value);

  if (absValue < 1000) {
    return parseFloat(absValue).toFixed(2);
  } else {
    const mValue = absValue / 1000;
    return parseFloat(mValue).toFixed(2);
  }
};

export const formatUnit = (value,type) => {

  // Dùng Math.abs để xử lý đúng cả trường hợp số âm (nếu có công suất âm)
  const absValue = Math.abs(value);

  if (absValue < 1000) {
    return `k${type}`;
  } else {
    const mValue = absValue / 1000;
    return `M${type}`;
  }
};


const Infor = (props) => {
  const lang = useIntl();
  const [dataInf, setDataInf] = useState({});

  const batteryStatus = {
    0: "Off",
    1: "Đang chờ",
    2: "Lỗi",
    3: "Sạc",
    4: "Xả",
    5: "Chg.derate",
    6: "Disch.derate",
  }

  useEffect(() => {
    // console.log(props.data);
    setDataInf(props.data);
  }, [props.data]);

  return (
    <div className="DAT_Infor">
      <div className="DAT_Infor_Card_SOC">
        <div className="DAT_Infor_Card_SOC_Label">
          {lang.formatMessage({ id: "dashboard_kpi_soc_short", defaultMessage: "SOC" })}
        </div>
        <div className="DAT_Infor_Card_SOC_Body">
          <div className="DAT_Infor_Card_SOC_Body_Header">
            <div className="DAT_Infor_Card_SOC_Body_Header_Title">
              {lang.formatMessage({ id: "dashboard_kpi_battery_status" })}
            </div>
          </div>
          <div className="DAT_Infor_Card_SOC_Body_Value">
            <div className="DAT_Infor_Card_SOC_Body_Value_Val">{parseFloat(dataInf?.["8203-1"] * 0.1).toFixed(0) || 0}%</div>
            <div className="DAT_Infor_Card_SOC_Body_Value_Status">
              {batteryStatus[dataInf?.["7000-1"] || 0]}
            </div>
          </div>
          <div className="DAT_Infor_Card_SOC_Body_Progress">
            <div className="DAT_Infor_Card_SOC_Body_Progress_Bar">
              <div
                className="DAT_Infor_Card_SOC_Body_Progress_Bar_Fill"
                style={{ width: `${Math.min(100, Math.max(0, parseFloat(dataInf?.["8203-1"] * 0.1).toFixed(0) || 0))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="DAT_Infor_Card_SOH">
        <div className="DAT_Infor_Card_SOH_Label">
          {lang.formatMessage({ id: "dashboard_kpi_soh_short", defaultMessage: "SOH" })}
        </div>
        <div className="DAT_Infor_Card_SOH_Body">
          <div className="DAT_Infor_Card_SOH_Body_Header">
            <div className="DAT_Infor_Card_SOH_Body_Header_Title">
              {lang.formatMessage({ id: "dashboard_kpi_battery_health" })}
            </div>
          </div>
          <div className="DAT_Infor_Card_SOH_Body_Value">
            <div className="DAT_Infor_Card_SOH_Body_Value_Val">{parseFloat(dataInf?.["8204-1"] * 0.1).toFixed(0) || 0}%</div>
          </div>
          <div className="DAT_Infor_Card_SOH_Body_Progress">
            <div className="DAT_Infor_Card_SOH_Body_Progress_Bar">
              <div
                className="DAT_Infor_Card_SOH_Body_Progress_Bar_Fill"
                style={{ width: `${Math.min(100, Math.max(0, parseFloat(dataInf?.["8204-1"] * 0.1).toFixed(0) || 0))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="DAT_Infor_Card_PowerOutput">
        <div className="DAT_Infor_Card_PowerOutput_Label">
          {lang.formatMessage({ id: "dashboard_kpi_power_short", defaultMessage: "P" })}
        </div>
        <div className="DAT_Infor_Card_PowerOutput_Body">
          <div className="DAT_Infor_Card_PowerOutput_Body_Header">
            <div className="DAT_Infor_Card_PowerOutput_Body_Header_Title">
              {lang.formatMessage({ id: "dashboard_kpi_power" })}
            </div>
          </div>
          <div className="DAT_Infor_Card_PowerOutput_Body_Value">
            <div className="DAT_Infor_Card_PowerOutput_Body_Value_Val">{formatPower(convertToDoublewordAndFloat([dataInf?.["7004-1"], dataInf?.["7003-1"]], "dw", 0.001) || 0)}</div>
            <div className="DAT_Infor_Card_PowerOutput_Body_Value_Unit">{formatUnit(convertToDoublewordAndFloat([dataInf?.["7004-1"], dataInf?.["7003-1"]], "dw", 0.001) || 0, "Wh")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Infor;
