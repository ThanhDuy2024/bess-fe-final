import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
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

export const formatUnit = (value, type) => {

  // Dùng Math.abs để xử lý đúng cả trường hợp số âm (nếu có công suất âm)
  const absValue = Math.abs(value);

  if (absValue < 1000) {
    return `k${type}`;
  } else {
    const mValue = absValue / 1000;
    return `M${type}`;
  }
};

export default function Flow(props) {
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
    setDataInf(props.data);
  }, [props.data]);

  return (
    <svg
      viewBox="0 0 815 560"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <linearGradient
          id="gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="650"
          y2="0"
          spreadMethod="repeat"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="5%" stopColor="white" stopOpacity="1" />
          <stop offset="10%" stopColor="white" stopOpacity="0" />
          <stop offset="30%" stopColor="white" stopOpacity="0" />
          <stop offset="35%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor="white" stopOpacity="0" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="65%" stopColor="white" stopOpacity="1" />
          <stop offset="70%" stopColor="white" stopOpacity="0" />
          <stop offset="90%" stopColor="white" stopOpacity="1" />
          <stop offset="95%" stopColor="white" stopOpacity="0" />
          <animate
            attributeName="x1"
            attributeType="XML"
            values="-650; 650"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            attributeType="XML"
            values="0; 1300"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </linearGradient>

        <mask id="gradient-mask" maskUnits="userSpaceOnUse">
          <rect
            x="-2000"
            y="-2000"
            width="4000"
            height="4000"
            fill="url(#gradient)"
          />
        </mask>

        <linearGradient
          id="gradient-reverse"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="650"
          y2="0"
          spreadMethod="repeat"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="5%" stopColor="white" stopOpacity="1" />
          <stop offset="10%" stopColor="white" stopOpacity="0" />
          <stop offset="30%" stopColor="white" stopOpacity="0" />
          <stop offset="35%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor="white" stopOpacity="0" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="65%" stopColor="white" stopOpacity="1" />
          <stop offset="70%" stopColor="white" stopOpacity="0" />
          <stop offset="90%" stopColor="white" stopOpacity="1" />
          <stop offset="95%" stopColor="white" stopOpacity="0" />
          <animate
            attributeName="x1"
            attributeType="XML"
            values="650; -650"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            attributeType="XML"
            values="1300; 0"
            dur="5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </linearGradient>

        <mask id="gradient-mask-reverse" maskUnits="userSpaceOnUse">
          <rect
            x="-2000"
            y="-2000"
            width="4000"
            height="4000"
            fill="url(#gradient-reverse)"
          />
        </mask>
      </defs>

      <>
        <rect
          x="-347.19"
          y="167.022"
          width="395.836"
          height="253.584"
          style={{
            fill: "rgb(216, 216, 216)",
            stroke: "rgb(0, 0, 0)",
            transformBox: "fill-box",
            transformOrigin: "50% 50%",
            strokeWidth: "0px",
          }}
          transform="matrix(0.896181, -0.443689, 1.126672, 0.558043, 542.66611, 70.966677)"
        />
        <foreignObject x="250" y="110" width="450" height="250">
          <img src="/pictures/tree_day.png" alt="" width="100%" height="100%" />
        </foreignObject>
        <foreignObject x="145" y="100" width="100" height="250">
          <img src="/pictures/Grid.png" alt="" width="100%" height="100%" />
        </foreignObject>
        <foreignObject x="150" y="180" width="500" height="300">
          <img src="/pictures/Factory.png" alt="" width="100%" height="100%" />
        </foreignObject>
      </>

      <path
        id="LineA"
        className="path"
        d="M 119.941 149.954 L 160.13 150.076"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(0, 0, 0, 0.5)",
          strokeWidth: "1",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: "3",
          overflow: "hidden",
        }}
      />
      <path
        id="LineA1"
        className="path"
        d="M 155.125 210.84 C 157.373 280.604 169.304 304.053 224.993 313.377 C 224.993 313.377 305.421 370.525 314.872 379.42 L 323.997 375.566 L 324.426 428.75"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(0, 0, 0, 0.2)",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
        }}
      />
      {(Number(dataInf?.["7000-1"]) === 3 || Number(dataInf?.["7000-1"]) === 5) && <path
        id="LineA2"
        className="path"
        d="M 155.125 210.84 C 157.373 280.604 169.304 304.053 224.993 313.377 C 224.993 313.377 305.421 370.525 314.872 379.42 L 323.997 375.566 L 324.426 428.75"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(255, 48, 29, 1)",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
          mask: "url(#gradient-mask)",
        }}
      />}
      <foreignObject x="20" y="100" width="100" height="80">
        <div
          className="DAT_DataText"
          style={{ border: "1px solid rgba(255, 48, 29, 1)" }}
        >
          <div className="DAT_DataText_Data">
            <div className="DAT_DataText_Data_Val">{formatPower(parseFloat(dataInf?.["7022-1"] * 1).toFixed(1) || 0)}</div>
            <div className="DAT_DataText_Data_Unit">{formatUnit(parseFloat(dataInf?.["7022-1"] * 1).toFixed(1) || 0, "W")}</div>
          </div>
          <span style={{ color: "rgba(255, 48, 29, 1)" }}>
            {lang.formatMessage({ id: "dashboard_energy_grid" })}
          </span>
        </div>
      </foreignObject>

      <path
        id="LineB"
        className="path"
        d="M 272.337 478.882 L 272.575 426.829"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(0, 0, 0, 0.5)",
          strokeWidth: "1",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: "3",
          overflow: "hidden",
        }}
      />
      <path
        id="LineB1"
        className="path"
        d="M 270.899 422.274 L 319.268 446.595"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(0, 0, 0, 0.2)",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
        }}
      />
      {(Number(dataInf?.["7000-1"]) === 4 || Number(dataInf?.["7000-1"]) === 6) && <path
        id="LineB2"
        className="path"
        d="M 270.899 422.274 L 319.268 446.595"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "#E4B322",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
          mask: "url(#gradient-mask-reverse)",
        }}
      />}
      <foreignObject x="265" y="415" width="20" height="20">
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 1)",
            width: "15px",
            height: "15px",
            borderRadius: "50%",
            border: "solid 2px #E4B322",
          }}
        />
      </foreignObject>
      <foreignObject x="200" y="480" width="100" height="80">
        <div className="DAT_DataText" style={{ border: "1px solid #E4B322" }}>
          <div className="DAT_DataText_Data">
            <div className="DAT_DataText_Data_Val">{formatPower(parseFloat(dataInf?.["7024-1"] * 1).toFixed(1) || 0)}</div>
            <div className="DAT_DataText_Data_Unit">{formatUnit(parseFloat(dataInf?.["7024-1"] * 1).toFixed(1) || 0, "W")}</div>
          </div>
          <span style={{ color: "#E4B322" }}>
            {lang.formatMessage({ id: "dashboard_energy_load_consumption" })}
          </span>
        </div>
      </foreignObject>

      <path
        id="LineC"
        className="path"
        d="M 488.186 424.065 L 559.386 423.993"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(0, 0, 0, 0.5)",
          strokeWidth: "1",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: "3",
          overflow: "hidden",
        }}
      />
      <path
        id="LineC1"
        className="path"
        d="M 343.43 439.664 L 381.893 421.39"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(0, 0, 0, 0.2)",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
        }}
      />
      {(Number(dataInf?.["7000-1"]) === 3 || Number(dataInf?.["7000-1"]) === 5) && <path
        id="LineC2"
        className="path"
        d="M 343.43 439.664 L 381.893 421.39"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(32, 128, 245, 1)",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
          mask: `url(#gradient-mask)`,
        }}
      />}

      {(Number(dataInf?.["7000-1"]) === 4 || Number(dataInf?.["7000-1"]) === 6) && <path
        id="LineC2"
        className="path"
        d="M 343.43 439.664 L 381.893 421.39"
        style={{
          width: "100%",
          height: "100%",
          fill: "none",
          stroke: "rgba(32, 128, 245, 1)",
          strokeWidth: "3",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          overflow: "hidden",
          mask: `url(#gradient-mask-reverse)`,
        }}
      />}
      <foreignObject x="560" y="410" width="100" height="80">
        <div
          className="DAT_DataText"
          style={{ border: "1px solid rgba(32, 128, 245, 1)" }}
        >
          <div className="DAT_DataText_Data">
            <div className="DAT_DataText_Data_Val">{formatPower(convertToDoublewordAndFloat([dataInf?.["7004-1"], dataInf?.["7003-1"]], "dw", 0.001) || 0)}</div>
            <div className="DAT_DataText_Data_Unit">{formatUnit(convertToDoublewordAndFloat([dataInf?.["7004-1"], dataInf?.["7003-1"]], "dw", 0.001) || 0, "W")}</div>
          </div>
          <span style={{ color: "rgba(32, 128, 245, 1)" }}>
            {lang.formatMessage({ id: "dashboard_energy_storage" })}
          </span>
        </div>
      </foreignObject>

      <foreignObject
        x="375"
        y="375"
        width="115"
        height="90"
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transform="matrix(0.935735, -0.056624, 0.023937, 0.9478, -0.92938, -9.527987)"
      >
        <img src="/pictures/bess.png" alt="" width="100%" height="100%" />
      </foreignObject>
      <foreignObject
        x="338.009"
        y="220"
        width="35"
        height="50"
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transform="matrix(0.868623, -0.019845, 0.026762, 1.021506, -21.485769, 204.175858)"
      >
        <img
          src="/pictures/Bat.png"
          alt=""
          width="100%"
          height="100%"
          style={{ transform: "scaleX(-1)" }}
        />
      </foreignObject>
    </svg>
  );
}
