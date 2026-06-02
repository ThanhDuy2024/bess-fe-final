import React, { useEffect, useMemo, useState } from "react";
import { LuBatteryCharging, LuDownload, LuZap, LuCpu } from "react-icons/lu";
import {
  Chart as ChartJS,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import { useIntl } from "react-intl";
import { callApi } from "../../Api/Api";
import StatusBadge from "../../Modal/StatusBadge";
import {
  mockEnergyReport,
  mockHourlyData,
  mockPCSFaults,
  mockSystemSummary as sys,
} from "../../data/mockData";
import { socket } from "../../../App";
import "./PCS.scss";
import { isMobile } from "react-device-detect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels,
  zoomPlugin,
);

const defaultChartDate = mockEnergyReport[0]?.date ?? "2026-05-19";

const acMetricTabs = [
  { key: "power", label: "P", unit: "kW", color: "rgba(22, 119, 255, 1)", fillColor: "rgba(22, 119, 255, 0.1)" },
  { key: "voltage", label: "V", unit: "V", color: "rgba(14, 165, 233, 1)", fillColor: "rgba(14, 165, 233, 0.1)" },
  { key: "current", label: "A", unit: "A", color: "rgba(245, 158, 11, 1)", fillColor: "rgba(245, 158, 11, 0.1)" },
  { key: "frequency", label: "Hz", unit: "Hz", color: "rgba(139, 92, 246, 1)", fillColor: "rgba(139, 92, 246, 0.1)" },
  { key: "efficiency", label: "Eff", unit: "%", color: "rgba(16, 185, 129, 1)", fillColor: "rgba(16, 185, 129, 0.1)" },
];

const dcMetricTabs = [
  { key: "power", label: "P", unit: "kW", color: "rgba(37, 99, 235, 1)", fillColor: "rgba(37, 99, 235, 0.1)" },
  { key: "voltage", label: "V", unit: "V", color: "rgba(6, 182, 212, 1)", fillColor: "rgba(6, 182, 212, 0.1)" },
  { key: "current", label: "A", unit: "A", color: "rgba(249, 115, 22, 1)", fillColor: "rgba(249, 115, 22, 0.1)" },
];

const pcsUnits = [
  { key: "unit1", label: "Unit 1" },
  { key: "unit2", label: "Unit 2" },
];

const buildChartConfig = (rows, metric, title) => {
  const values = rows.map((item) => item.value);
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const averageText = `${average.toFixed(metric.unit === "%" || metric.unit === "Hz" ? 2 : 1)} ${metric.unit}`;

  return {
    data: {
      labels: rows.map((item) => item.time),
      datasets: [
        {
          label: title,
          data: values,
          borderColor: metric.color,
          backgroundColor: metric.fillColor,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: metric.color,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 1)",
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context) => context[0]?.label ?? "",
            label: (context) => `${title}: ${context.formattedValue} ${metric.unit}`,
          },
        },
        annotation: {
          annotations: {
            averageLine: {
              type: "line",
              yMin: average,
              yMax: average,
              borderColor: "rgba(148, 163, 184, 1)",
              borderDash: [6, 6],
              borderWidth: 1.5,
              label: {
                display: true,
                content: `AVG ${averageText}`,
                backgroundColor: "rgba(226, 232, 240, 1)",
                color: "rgba(51, 65, 85, 1)",
                padding: 6,
                position: "end",
              },
            },
          },
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(100, 116, 139, 1)",
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: {
            color: "rgba(226, 232, 240, 1)",
          },
          ticks: {
            color: "rgba(100, 116, 139, 1)",
            callback: (value) => `${value} ${metric.unit}`,
          },
        },
      },
    },
  };
};

const PCS = (props) => {
  const lang = useIntl();
  const [dataInf, setDataInf] = useState({});
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(defaultChartDate);
  const [selectedUnit, setSelectedUnit] = useState(pcsUnits[0].key);
  const [selectedAcMetric, setSelectedAcMetric] = useState(acMetricTabs[0].key);
  const [selectedDcMetric, setSelectedDcMetric] = useState(dcMetricTabs[0].key);
  const batteryStatus = {
    0: "Off",
    1: "Pending",
    2: "Error",
    3: "Charging",
    4: "Discharging",
    5: "Chg.derate",
    6: "Disch.derate",
  }

  useEffect(() => {


    (async () => {
      let data = await callApi("post", process.env.REACT_APP_API + "/data/readBess", {
        level: "pcslevel",
      });
      console.log(data);
      if (data.status === "true") {
        setDataInf(data.data);
        setStep(1);
      } else {
        console.log("Failed to get data");
      }
    })();
  }, []);

  useEffect(() => {


    if (!step) return;
    console.log('Connecting to Socket.IO server...');
    socket.value.emit("BESS_SUBSCRIBE", {
      level: "pcslevel"
    });

    // socket.value.emit("BESS_SUBSCRIBE_MANY", {
    //     levels: ["pcslevel"],
    // });

    socket.value.on("BESS_DATA", (payload) => {
      // console.log(payload.level, payload.data);

      Object.keys(payload.data).map((keyName, i) => {

        setDataInf(data => ({ ...data, [keyName]: payload.data[keyName] }));
      });
    });


    return () => {
      socket.value.emit("BESS_UNSUBSCRIBE", {
        level: "pcslevel",
      });

      // socket.value.emit("BESS_UNSUBSCRIBE_MANY", {
      //     levels: ["pcslevel", "bmslevel"],
      // });
      socket.value.off("BESS_DATA");
    };


  }, [step]);

  const pcsUnitData = useMemo(
    () => ({
      unit1: {
        acPhases: [
          {
            phase: "R",
            voltage: `${parseFloat(dataInf?.["7316-1"] * 0.1).toFixed(0) || 0} V`,
            current: `${parseFloat(dataInf?.["7319-1"] * 0.1).toFixed(0) || 0} A`,
            power: `${parseFloat((dataInf?.["7316-1"] * 0.1) * (dataInf?.["7319-1"] * 0.1) * (dataInf?.["7358-1"] * 0.001) / 1000).toFixed(0) || 0} kW`,
            frequency: `${parseFloat(dataInf?.["7333-1"] * 1).toFixed(0) || 0} Hz`,
          },
          {
            phase: "S",
            voltage: `${parseFloat(dataInf?.["7317-1"] * 0.1).toFixed(0) || 0} V`,
            current: `${parseFloat(dataInf?.["7320-1"] * 0.1).toFixed(0) || 0} A`,
            power: `${parseFloat((dataInf?.["7317-1"] * 0.1) * (dataInf?.["7320-1"] * 0.1) * (dataInf?.["7358-1"] * 0.001) / 1000).toFixed(0) || 0} kW`,
            frequency: "-",
          },
          {
            phase: "T",
            voltage: `${parseFloat(dataInf?.["7318-1"] * 0.1).toFixed(0) || 0} V`,
            current: `${parseFloat(dataInf?.["7321-1"] * 0.1).toFixed(0) || 0} A`,
            power: `${parseFloat((dataInf?.["7318-1"] * 0.1) * (dataInf?.["7321-1"] * 0.1) * (dataInf?.["7358-1"] * 0.001) / 1000).toFixed(0) || 0} kW`,
            frequency: "-",
          },
        ],
        dcMetrics: [
          [lang.formatMessage({ id: "voltage_DC" }), `${parseFloat(dataInf?.["7329-1"] * 0.1).toFixed(0) || 0} V`],
          [lang.formatMessage({ id: "current_DC" }), `${parseFloat(dataInf?.["7330-1"] * 0.1).toFixed(0) || 0} A`],
          [lang.formatMessage({ id: "power_DC" }), `${parseFloat(dataInf?.["7331-1"] / 1000).toFixed(0) || 0} kW`],
        ],
      },
      unit2: {
        acPhases: [
          {
            phase: "R",
            voltage: `${parseFloat(dataInf?.["7216-1"] * 0.1).toFixed(0) || 0} V`,
            current: `${parseFloat(dataInf?.["7219-1"] * 0.1).toFixed(0) || 0} A`,
            power: `${parseFloat((dataInf?.["7216-1"] * 0.1) * (dataInf?.["7219-1"] * 0.1) * (dataInf?.["7258-1"] * 0.001) / 1000).toFixed(0) || 0} kW`,
            frequency: `${parseFloat(dataInf?.["7233-1"] * 1).toFixed(0) || 0} Hz`,
          },
          {
            phase: "S",
            voltage: `${parseFloat(dataInf?.["7217-1"] * 0.1).toFixed(0) || 0} V`,
            current: `${parseFloat(dataInf?.["7220-1"] * 0.1).toFixed(0) || 0} A`,
            power: `${parseFloat((dataInf?.["7217-1"] * 0.1) * (dataInf?.["7220-1"] * 0.1) * (dataInf?.["7258-1"] * 0.001) / 1000).toFixed(0) || 0} kW`,
            frequency: "-",
          },
          {
            phase: "T",
            voltage: `${parseFloat(dataInf?.["7218-1"] * 0.1).toFixed(0) || 0} V`,
            current: `${parseFloat(dataInf?.["7221-1"] * 0.1).toFixed(0) || 0} A`,
            power: `${parseFloat((dataInf?.["7218-1"] * 0.1) * (dataInf?.["7221-1"] * 0.1) * (dataInf?.["7258-1"] * 0.001) / 1000).toFixed(0) || 0} kW`,
            frequency: "-",
          },
        ],
        dcMetrics: [
          [lang.formatMessage({ id: "voltage_DC" }), `${parseFloat(dataInf?.["7229-1"] * 0.1).toFixed(0) || 0} V`],
          [lang.formatMessage({ id: "current_DC" }), `${parseFloat(dataInf?.["7230-1"] * 0.1).toFixed(0) || 0} A`],
          [lang.formatMessage({ id: "power_DC" }), `${parseFloat(dataInf?.["7231-1"] / 1000).toFixed(0) || 0} kW`],
        ],
      },
    }),
    [lang, dataInf],
  );

  const activeUnitData = pcsUnitData[selectedUnit] ?? pcsUnitData.unit1;

  const chartSeed = useMemo(() => Number(selectedDate.slice(-2)) || 1, [selectedDate]);

  const pcsTrendData = useMemo(
    () =>
      mockHourlyData.map((item, index) => ({
        time: item.time,
        acPower: Math.max(
          0,
          sys.pcsACPower + Math.sin((index + chartSeed) / 4) * 22 + (item.gridPower - 150) * 0.08,
        ),
        acVoltage: Math.max(360, sys.pcsACVoltage + Math.cos((index + chartSeed) / 5) * 9),
        acCurrent: Math.max(120, sys.pcsACCurrent + Math.sin((index + chartSeed) / 4.5) * 28),
        acFrequency: +(sys.pcsFrequency + Math.cos((index + chartSeed) / 6) * 0.06).toFixed(2),
        acEfficiency: +(sys.pcsEfficiency + Math.sin((index + chartSeed) / 7) * 0.9).toFixed(2),
        dcPower: Math.max(
          0,
          sys.pcsDCPower + Math.sin((index + chartSeed) / 3.8) * 24 + item.batteryPower * 0.05,
        ),
        dcVoltage: Math.max(700, sys.pcsDCVoltage + Math.cos((index + chartSeed) / 4.5) * 16),
        dcCurrent: Math.max(120, sys.pcsDCCurrent + Math.sin((index + chartSeed) / 4) * 20),
      })),
    [chartSeed],
  );

  const acChartMeta = useMemo(
    () => ({
      power: { title: lang.formatMessage({ id: "power_AC" }), key: "acPower" },
      voltage: { title: lang.formatMessage({ id: "voltage_AC" }), key: "acVoltage" },
      current: { title: lang.formatMessage({ id: "current_AC" }), key: "acCurrent" },
      frequency: { title: lang.formatMessage({ id: "frequency" }), key: "acFrequency" },
      efficiency: { title: lang.formatMessage({ id: "effciency" }), key: "acEfficiency" },
    }),
    [lang],
  );

  const dcChartMeta = useMemo(
    () => ({
      power: { title: lang.formatMessage({ id: "power_DC" }), key: "dcPower" },
      voltage: { title: lang.formatMessage({ id: "voltage_DC" }), key: "dcVoltage" },
      current: { title: lang.formatMessage({ id: "current_DC" }), key: "dcCurrent" },
    }),
    [lang],
  );

  const acMetric = acMetricTabs.find((item) => item.key === selectedAcMetric) ?? acMetricTabs[0];
  const dcMetric = dcMetricTabs.find((item) => item.key === selectedDcMetric) ?? dcMetricTabs[0];
  const selectedUnitLabel = pcsUnits.find((item) => item.key === selectedUnit)?.label ?? "Unit 1";

  const acChart = useMemo(() => {
    const currentMeta = acChartMeta[selectedAcMetric];
    const rows = pcsTrendData.map((item) => ({
      time: item.time,
      value: Number(item[currentMeta.key].toFixed?.(2) ?? item[currentMeta.key]),
    }));
    return buildChartConfig(rows, acMetric, currentMeta.title);
  }, [acChartMeta, acMetric, pcsTrendData, selectedAcMetric]);

  const dcChart = useMemo(() => {
    const currentMeta = dcChartMeta[selectedDcMetric];
    const rows = pcsTrendData.map((item) => ({
      time: item.time,
      value: Number(item[currentMeta.key].toFixed?.(2) ?? item[currentMeta.key]),
    }));
    return buildChartConfig(rows, dcMetric, currentMeta.title);
  }, [dcChartMeta, dcMetric, pcsTrendData, selectedDcMetric]);
  return (
    <>
      {isMobile ? (
        <div className="DAT_PCSMobile">
          <div className="DAT_PCSMobile_Overview">
            <div className="DAT_PCSMobile_Overview_OverviewTitle">
              <div className="DAT_PCSMobile_Overview_OverviewTitle_Header">
                <div className="DAT_PCSMobile_Overview_OverviewTitle_Header_Icon">
                  <LuCpu size={25} />
                </div >
                <div className="DAT_PCSMobile_Overview_OverviewTitle_Header_Title">PCS Level</div>
              </div >
              <div className="DAT_PCSMobile_Overview_OverviewTitle_StatusPill">
                <StatusBadge status={batteryStatus[dataInf?.["7000-1"] ?? 0]} />
              </div>
            </div >
            <div className="DAT_PCSMobile_Overview_OverviewStats">
              <div className="DAT_PCSMobile_Overview_OverviewStats_StatCard">
                <span className="DAT_PCSMobile_Overview_OverviewStats_StatCard_StatLabel">
                  Date System
                </span>
                <span className="DAT_PCSMobile_Overview_OverviewStats_StatCard_StatValue">{dataInf?.["7850-1"]}-{dataInf?.["7851-1"]}-{dataInf?.["7852-1"]}</span>

              </div>
              <div className="DAT_PCSMobile_Overview_OverviewStats_StatCard">
                <span className="DAT_PCSMobile_Overview_OverviewStats_StatCard_StatLabel">
                  Time System
                </span>
                <span className="DAT_PCSMobile_Overview_OverviewStats_StatCard_StatValue">{dataInf?.["7853-1"]}:{dataInf?.["7854-1"]}:{dataInf?.["7855-1"]}</span>

              </div>
            </div>
          </div >

          <div className="DAT_PCSMobile_PowerFlow">
            <div className="DAT_PCSMobile_PowerFlow_AC">
              <span className="DAT_PCSMobile_PowerFlow_AC_Title">
                <LuZap style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                {`${lang.formatMessage({ id: "pcs_ac" })} ${selectedUnitLabel.toUpperCase()}`}
              </span>
              <div className="DAT_PCSMobile_PowerFlow_AC_Table">
                <div className="DAT_PCSMobile_PowerFlow_AC_Table_Header">
                  <span className="DAT_PCSMobile_PowerFlow_AC_Table_Header_Phase"></span>
                  <span className="DAT_PCSMobile_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "voltage_AC" })}</span>
                  <span className="DAT_PCSMobile_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "current_AC" })}</span>
                  <span className="DAT_PCSMobile_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "power_AC" })}</span>
                  <span className="DAT_PCSMobile_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "frequency" })}</span>
                </div>
                {activeUnitData.acPhases.map((item) => (
                  <div key={item.phase} className="DAT_PCS_PowerFlow_AC_Table_Row">
                    <span className="DAT_PCSMobile_PowerFlow_AC_Table_Row_Phase">{item.phase}</span>
                    <span className="DAT_PCSMobile_PowerFlow_AC_Table_Row_Value">{item.voltage}</span>
                    <span className="DAT_PCSMobile_PowerFlow_AC_Table_Row_Value">{item.current}</span>
                    <span className="DAT_PCSMobile_PowerFlow_AC_Table_Row_Value">{item.power}</span>
                    <span className="DAT_PCSMobile_PowerFlow_AC_Table_Row_Value">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="DAT_PCSMobile_PowerFlow_Transfer">
              <div className="DAT_PCSMobile_PowerFlow_Transfer_Content">
                <div className="DAT_PCSMobile_PowerFlow_Transfer_Box">
                  <span className="DAT_PCSMobile_PowerFlow_Transfer_Box_Arrow" aria-hidden="true">↔</span>
                  <span className="DAT_PCSMobile_PowerFlow_Transfer_Box_Label">AC/DC</span>
                </div>
                <div className="DAT_PCSMobile_PowerFlow_Transfer_UnitSwitcher">
                  {pcsUnits.map((unit) => (
                    <button
                      key={unit.key}
                      type="button"
                      className={`DAT_PCSMobile_PowerFlow_Transfer_UnitButton ${selectedUnit === unit.key ? "DAT_PCS_PowerFlow_Transfer_UnitButton--active" : ""}`}
                      onClick={() => setSelectedUnit(unit.key)}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="DAT_PCSMobile_PowerFlow_DC">
              <span className="DAT_PCSMobile_PowerFlow_DC_Title">
                <LuBatteryCharging style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                {`${lang.formatMessage({ id: "pcs_dc" })} ${selectedUnitLabel.toUpperCase()}`}
              </span>
              <div className="DAT_PCSMobile_PowerFlow_DC_Table">
                <div className="DAT_PCSMobile_PowerFlow_DC_Table_Header">
                  {activeUnitData.dcMetrics.map(([label]) => (
                    <span key={label} className="DAT_PCS_PowerFlow_DC_Table_Header_Label">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="DAT_PCSMobile_PowerFlow_DC_Table_Row">
                  {activeUnitData.dcMetrics.map(([label, value]) => (
                    <span key={label} className="DAT_PCS_PowerFlow_DC_Table_Row_Value">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="DAT_PCSMobile_ChartGrid">
            <div className="DAT_PCSMobile_ChartGrid_Panel">
              <span className="DAT_PCSMobile_ChartGrid_Panel_PanelTitle">{lang.formatMessage({ id: "pcs_ac_trend" })}</span>
              <div className="DAT_PCSMobile_ChartGrid_Panel_ControlRow">
                <div className="DAT_PCSMobile_ChartGrid_Panel_TabList">
                  {acMetricTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`DAT_PCSMobile_ChartGrid_Panel_TabButton ${selectedAcMetric === tab.key ? "DAT_PCS_ChartGrid_Panel_TabButton--active" : ""}`}
                      onClick={() => setSelectedAcMetric(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  className="DAT_PCSMobile_ChartGrid_Panel_DateInput"
                  value={selectedDate}
                  min={mockEnergyReport[mockEnergyReport.length - 1]?.date}
                  max={mockEnergyReport[0]?.date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="DAT_PCSMobile_ChartGrid_Panel_ChartWrap">
                <Line data={acChart.data} options={acChart.options} />
              </div>
            </div>

            <div className="DAT_PCSMobile_ChartGrid_Panel">
              <span className="DAT_PCSMobile_ChartGrid_Panel_PanelTitle">{lang.formatMessage({ id: "pcs_dc_trend" })}</span>
              <div className="DAT_PCSMobile_ChartGrid_Panel_ControlRow">
                <div className="DAT_PCSMobile_ChartGrid_Panel_TabList">
                  {dcMetricTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`DAT_PCSMobile_ChartGrid_Panel_TabButton ${selectedDcMetric === tab.key ? "DAT_PCS_ChartGrid_Panel_TabButton--active" : ""}`}
                      onClick={() => setSelectedDcMetric(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  className="DAT_PCSMobile_ChartGrid_Panel_DateInput"
                  value={selectedDate}
                  min={mockEnergyReport[mockEnergyReport.length - 1]?.date}
                  max={mockEnergyReport[0]?.date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="DAT_PCSMobile_ChartGrid_Panel_ChartWrap">
                <Line data={dcChart.data} options={dcChart.options} />
              </div>
            </div>
          </div>
        </div >
      ) : (
        <div className="DAT_PCS">
          <div className="DAT_PCS_Overview">
            <div className="DAT_PCS_Overview_OverviewTitle">
              <div className="DAT_PCS_Overview_OverviewTitle_Header">
                <div className="DAT_PCS_Overview_OverviewTitle_Header_Icon">
                  <LuCpu size={25} />
                </div >
                <div className="DAT_PCS_Overview_OverviewTitle_Header_Title">PCS Level</div>
              </div >
              <div className="DAT_PCS_Overview_OverviewTitle_StatusPill">
                <StatusBadge status={batteryStatus[dataInf?.["7000-1"] ?? 0]} />
              </div>
            </div >
            <div className="DAT_PCS_Overview_OverviewStats">
              <div className="DAT_PCS_Overview_OverviewStats_StatCard">
                <span className="DAT_PCS_Overview_OverviewStats_StatCard_StatLabel">
                  Date System
                </span>
                <span className="DAT_PCS_Overview_OverviewStats_StatCard_StatValue">{dataInf?.["7850-1"]}-{dataInf?.["7851-1"]}-{dataInf?.["7852-1"]}</span>

              </div>
              <div className="DAT_PCS_Overview_OverviewStats_StatCard">
                <span className="DAT_PCS_Overview_OverviewStats_StatCard_StatLabel">
                  Time System
                </span>
                <span className="DAT_PCS_Overview_OverviewStats_StatCard_StatValue">{dataInf?.["7853-1"]}:{dataInf?.["7854-1"]}:{dataInf?.["7855-1"]}</span>

              </div>
            </div>
          </div >

          <div className="DAT_PCS_PowerFlow">
            <div className="DAT_PCS_PowerFlow_AC">
              <span className="DAT_PCS_PowerFlow_AC_Title">
                <LuZap style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                {`${lang.formatMessage({ id: "pcs_ac" })} ${selectedUnitLabel.toUpperCase()}`}
              </span>
              <div className="DAT_PCS_PowerFlow_AC_Table">
                <div className="DAT_PCS_PowerFlow_AC_Table_Header">
                  <span className="DAT_PCS_PowerFlow_AC_Table_Header_Phase"></span>
                  <span className="DAT_PCS_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "voltage_AC" })}</span>
                  <span className="DAT_PCS_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "current_AC" })}</span>
                  <span className="DAT_PCS_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "power_AC" })}</span>
                  <span className="DAT_PCS_PowerFlow_AC_Table_Header_Label">{lang.formatMessage({ id: "frequency" })}</span>
                </div>
                {activeUnitData.acPhases.map((item) => (
                  <div key={item.phase} className="DAT_PCS_PowerFlow_AC_Table_Row">
                    <span className="DAT_PCS_PowerFlow_AC_Table_Row_Phase">{item.phase}</span>
                    <span className="DAT_PCS_PowerFlow_AC_Table_Row_Value">{item.voltage}</span>
                    <span className="DAT_PCS_PowerFlow_AC_Table_Row_Value">{item.current}</span>
                    <span className="DAT_PCS_PowerFlow_AC_Table_Row_Value">{item.power}</span>
                    <span className="DAT_PCS_PowerFlow_AC_Table_Row_Value">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="DAT_PCS_PowerFlow_Transfer">
              <div className="DAT_PCS_PowerFlow_Transfer_Content">
                <div className="DAT_PCS_PowerFlow_Transfer_Box">
                  <span className="DAT_PCS_PowerFlow_Transfer_Box_Arrow" aria-hidden="true">↔</span>
                  <span className="DAT_PCS_PowerFlow_Transfer_Box_Label">AC/DC</span>
                </div>
                <div className="DAT_PCS_PowerFlow_Transfer_UnitSwitcher">
                  {pcsUnits.map((unit) => (
                    <button
                      key={unit.key}
                      type="button"
                      className={`DAT_PCS_PowerFlow_Transfer_UnitButton ${selectedUnit === unit.key ? "DAT_PCS_PowerFlow_Transfer_UnitButton--active" : ""}`}
                      onClick={() => setSelectedUnit(unit.key)}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="DAT_PCS_PowerFlow_DC">
              <span className="DAT_PCS_PowerFlow_DC_Title">
                <LuBatteryCharging style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                {`${lang.formatMessage({ id: "pcs_dc" })} ${selectedUnitLabel.toUpperCase()}`}
              </span>
              <div className="DAT_PCS_PowerFlow_DC_Table">
                <div className="DAT_PCS_PowerFlow_DC_Table_Header">
                  {activeUnitData.dcMetrics.map(([label]) => (
                    <span key={label} className="DAT_PCS_PowerFlow_DC_Table_Header_Label">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="DAT_PCS_PowerFlow_DC_Table_Row">
                  {activeUnitData.dcMetrics.map(([label, value]) => (
                    <span key={label} className="DAT_PCS_PowerFlow_DC_Table_Row_Value">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="DAT_PCS_ChartGrid">
            <div className="DAT_PCS_ChartGrid_Panel">
              <span className="DAT_PCS_ChartGrid_Panel_PanelTitle">{lang.formatMessage({ id: "pcs_ac_trend" })}</span>
              <div className="DAT_PCS_ChartGrid_Panel_ControlRow">
                <div className="DAT_PCS_ChartGrid_Panel_TabList">
                  {acMetricTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`DAT_PCS_ChartGrid_Panel_TabButton ${selectedAcMetric === tab.key ? "DAT_PCS_ChartGrid_Panel_TabButton--active" : ""}`}
                      onClick={() => setSelectedAcMetric(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  className="DAT_PCS_ChartGrid_Panel_DateInput"
                  value={selectedDate}
                  min={mockEnergyReport[mockEnergyReport.length - 1]?.date}
                  max={mockEnergyReport[0]?.date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="DAT_PCS_ChartGrid_Panel_ChartWrap">
                <Line data={acChart.data} options={acChart.options} />
              </div>
            </div>

            <div className="DAT_PCS_ChartGrid_Panel">
              <span className="DAT_PCS_ChartGrid_Panel_PanelTitle">{lang.formatMessage({ id: "pcs_dc_trend" })}</span>
              <div className="DAT_PCS_ChartGrid_Panel_ControlRow">
                <div className="DAT_PCS_ChartGrid_Panel_TabList">
                  {dcMetricTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`DAT_PCS_ChartGrid_Panel_TabButton ${selectedDcMetric === tab.key ? "DAT_PCS_ChartGrid_Panel_TabButton--active" : ""}`}
                      onClick={() => setSelectedDcMetric(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  className="DAT_PCS_ChartGrid_Panel_DateInput"
                  value={selectedDate}
                  min={mockEnergyReport[mockEnergyReport.length - 1]?.date}
                  max={mockEnergyReport[0]?.date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="DAT_PCS_ChartGrid_Panel_ChartWrap">
                <Line data={dcChart.data} options={dcChart.options} />
              </div>
            </div>
          </div>
        </div >
      )}
    </>
  );
};

export default PCS;
