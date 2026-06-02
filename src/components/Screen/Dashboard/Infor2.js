import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { mockSystemSummary as sys } from "../../data/mockData";
import { convertToDoublewordAndFloat } from "../../../App";

const formatValue = (value) => {
  return Number(value).toFixed(2).replace(/\.00$/, "");
};


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


const Infor2 = (props) => {
  const lang = useIntl();
  const [dataInf, setDataInf] = useState({});

  useEffect(() => {
    // console.log(props.data);
    setDataInf(props.data);
  }, [props.data]);

  return (
    <div className="DAT_Infor2">
      <div className="DAT_Infor2_Card_Charge">
        <div className="DAT_Infor2_Card_Charge_Label">
          {lang.formatMessage({ id: "dashboard_kpi_charge" })}
        </div>
        <div className="DAT_Infor2_Card_Charge_Body">
          <div className="DAT_Infor2_Card_Charge_Body_Item">
            <span className="DAT_Infor2_Card_Charge_Body_Item_Label">
              {lang.formatMessage({ id: "dashboard_common_today" })}
            </span>
            <div className="DAT_Infor2_Card_Charge_Body_Item_Value">
              <div className="DAT_Infor2_Card_Charge_Body_Item_Value_Val">
                {formatPower(convertToDoublewordAndFloat([dataInf?.["7015-1"], dataInf?.["7014-1"]], "dw", 0.1) || 0)}
              </div>
              <div className="DAT_Infor2_Card_Charge_Body_Item_Value_Unit">
                {formatUnit(convertToDoublewordAndFloat([dataInf?.["7015-1"], dataInf?.["7014-1"]], "dw", 0.1) || 0, "Wh")}
              </div>
            </div>
          </div>
          <div className="DAT_Infor2_Card_Charge_Body_Divider" />
          <div className="DAT_Infor2_Card_Charge_Body_Item">
            <span className="DAT_Infor2_Card_Charge_Body_Item_Label">
              {lang.formatMessage({ id: "dashboard_common_total" })}
            </span>
            <div className="DAT_Infor2_Card_Charge_Body_Item_Value">
              <div className="DAT_Infor2_Card_Charge_Body_Item_Value_Val">
                {formatPower(convertToDoublewordAndFloat([dataInf?.["7019-1"], dataInf?.["7018-1"]], "dw", 1) || 0)}
              </div>
              <div className="DAT_Infor2_Card_Charge_Body_Item_Value_Unit">
                {formatUnit(convertToDoublewordAndFloat([dataInf?.["7019-1"], dataInf?.["7018-1"]], "dw", 1) || 0, "Wh")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="DAT_Infor2_Card_Discharge">
        <div className="DAT_Infor2_Card_Discharge_Label">
          {lang.formatMessage({ id: "dashboard_kpi_discharge" })}
        </div>
        <div className="DAT_Infor2_Card_Discharge_Body">
          <div className="DAT_Infor2_Card_Discharge_Body_Item">
            <span className="DAT_Infor2_Card_Discharge_Body_Item_Label">
              {lang.formatMessage({ id: "dashboard_common_today" })}
            </span>
            <div className="DAT_Infor2_Card_Discharge_Body_Item_Value">
              <div className="DAT_Infor2_Card_Discharge_Body_Item_Value_Val">
                {formatPower(convertToDoublewordAndFloat([dataInf?.["7017-1"], dataInf?.["7016-1"]], "dw", 0.1) || 0)}
              </div>
              <div className="DAT_Infor2_Card_Discharge_Body_Item_Value_Unit">
                {formatUnit(convertToDoublewordAndFloat([dataInf?.["7017-1"], dataInf?.["7016-1"]], "dw", 0.1) || 0, "Wh")}
              </div>
            </div>
          </div>
          <div className="DAT_Infor2_Card_Discharge_Body_Divider" />
          <div className="DAT_Infor2_Card_Discharge_Body_Item">
            <span className="DAT_Infor2_Card_Discharge_Body_Item_Label">
              {lang.formatMessage({ id: "dashboard_common_total" })}
            </span>
            <div className="DAT_Infor2_Card_Discharge_Body_Item_Value">
              <div className="DAT_Infor2_Card_Discharge_Body_Item_Value_Val">
                {formatPower(convertToDoublewordAndFloat([dataInf?.["7021-1"], dataInf?.["7020-1"]], "dw", 1) || 0)}
              </div>
              <div className="DAT_Infor2_Card_Discharge_Body_Item_Value_Unit">
                {formatUnit(convertToDoublewordAndFloat([dataInf?.["7021-1"], dataInf?.["7020-1"]], "dw", 1) || 0, "Wh")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Infor2;
