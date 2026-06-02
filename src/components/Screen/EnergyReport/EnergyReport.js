import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { mockEnergyReport, mockEnergyReportHourly } from "../../data/mockData";
import "./EnergyReport.scss";
import { useIntl } from "react-intl";
import { LuCalendar, LuChartNoAxesCombined } from "react-icons/lu";
import { PiExportLight } from "react-icons/pi";
import { isMobile } from "react-device-detect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
);

const monthNamesVi = [
  "Một",
  "Hai",
  "Ba",
  "Tư",
  "Năm",
  "Sáu",
  "Bảy",
  "Tám",
  "Chín",
  "Mười",
  "Mười Một",
  "Mười Hai",
];
const monthNamesEn = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const shortMonthNamesVi = [
  "Thg1",
  "Thg2",
  "Thg3",
  "Thg4",
  "Thg5",
  "Thg6",
  "Thg7",
  "Thg8",
  "Thg9",
  "Thg10",
  "Thg11",
  "Thg12",
];
const shortMonthNamesEn = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EnergyReport() {
  const lang = useIntl();
  const [viewMode, setViewMode] = useState("day"); // "day" or "month"
  const [showDropdown, setShowDropdown] = useState(false);

  const latestDate = useMemo(() => {
    if (mockEnergyReport && mockEnergyReport.length > 0) {
      return new Date(mockEnergyReport[0].date);
    }
    return new Date();
  }, []);

  const [selectedDate, setSelectedDate] = useState(latestDate);
  const [navDate, setNavDate] = useState(new Date(latestDate.getTime()));

  const formatToDayMonth = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const formatHourLabel = (timeStr) => timeStr || "";

  const formattedDateDisplay = useMemo(() => {
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    if (viewMode === "day") {
      return `${dd}/${mm}/${selectedDate.getFullYear()}`;
    } else {
      if (lang.locale === "vi") {
        return `Tháng ${monthNamesVi[selectedDate.getMonth()]}`;
      } else {
        return `${monthNamesEn[selectedDate.getMonth()]}`;
      }
    }
  }, [selectedDate, viewMode, lang]);

  const handlePrevMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setNavDate(new Date(navDate.getFullYear() - 1, navDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setNavDate(new Date(navDate.getFullYear() + 1, navDate.getMonth(), 1));
  };

  const getDaysInMonth = () => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();
    const firstDayInstance = new Date(year, month, 1);

    let startDay = firstDayInstance.getDay();
    if (startDay === 0) startDay = 7;
    const paddingDays = startDay - 1;

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const currentMonthLastDate = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = paddingDays - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      cells.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(year, month - 1, d),
      });
    }

    for (let i = 1; i <= currentMonthLastDate; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const totalCells = 42;
    const remainingCells = totalCells - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return cells;
  };

  const handleSelectDay = (dayDate) => {
    setSelectedDate(dayDate);
    setShowDropdown(false);
  };

  const handleSelectMonth = (monthIdx) => {
    const newDate = new Date(navDate.getFullYear(), monthIdx, 1);
    setSelectedDate(newDate);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedDate(latestDate);
    setNavDate(new Date(latestDate.getTime()));
    setShowDropdown(false);
  };

  const handleSelectToday = () => {
    setSelectedDate(latestDate);
    setNavDate(new Date(latestDate.getTime()));
    setShowDropdown(false);
  };

  const rows = useMemo(() => {
    if (viewMode === "day") {
      return mockEnergyReportHourly.filter((item) => {
        const d = new Date(item.date);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    return mockEnergyReport.filter((item) => {
      const d = new Date(item.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [viewMode, selectedDate]);

  const chartLabels = useMemo(() => {
    if (viewMode === "day") {
      return rows.map((item) => formatHourLabel(item.time));
    }

    return rows
      .slice()
      .reverse()
      .map((item) => formatToDayMonth(item.date));
  }, [rows, viewMode]);

  const chartRows = useMemo(() => {
    if (viewMode === "day") {
      return rows;
    }

    return rows.slice().reverse();
  }, [rows, viewMode]);

  const summary = rows.reduce(
    (acc, row) => ({
      charge: acc.charge + row.charge,
      discharge: acc.discharge + row.discharge,
      pv: acc.pv + row.pv,
      gridImport: acc.gridImport + row.gridImport,
      gridExport: acc.gridExport + row.gridExport,
      load: acc.load + row.load,
      efficiency: acc.efficiency + row.efficiency,
      cycles: acc.cycles + row.cycles,
    }),
    {
      charge: 0,
      discharge: 0,
      pv: 0,
      gridImport: 0,
      gridExport: 0,
      load: 0,
      efficiency: 0,
      cycles: 0,
    },
  );

  const avgEfficiency = rows.length
    ? (summary.efficiency / rows.length).toFixed(1)
    : 0;
  const costSaving = Math.round(summary.discharge * 0.12);
  const revenue = Math.round(summary.gridExport * 0.08);
  const isDayView = viewMode === "day";
  const axisNumberFormatter = new Intl.NumberFormat(
    lang.locale === "vi" ? "vi-VN" : "en-US",
  );

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 18,
          boxHeight: 18,
          usePointStyle: false,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 50,
          minRotation: 50,
          color: "rgba(90, 95, 107, 1)",
        },
        border: {
          color: "rgba(183, 191, 204, 1)",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(219, 224, 231, 1)",
          borderDash: [3, 3],
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "rgba(90, 95, 107, 1)",
          callback: (value) => axisNumberFormatter.format(value),
        },
        border: {
          color: "rgba(183, 191, 204, 1)",
        },
      },
    },
  };

  const lineChartOptions = {
    ...commonChartOptions,
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
      },
      line: {
        borderWidth: 2,
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    datasets: {
      bar: {
        grouped: true,
        categoryPercentage: 0.72,
        barPercentage: 0.82,
      },
    },
  };

  return (
    <>
      {isMobile ? (
        <div className="DAT_Mobile_Report">
          <div className="DAT_Mobile_Report_Toolbar">
            <div className="DAT_Mobile_Report_Toolbar_Title">
              <div>
                <LuChartNoAxesCombined />
                {lang.formatMessage({ id: "energy_report" })}
              </div>
              <div>
                <PiExportLight />
              </div>
            </div>

            <div className="DAT_Mobile_Report_Toolbar_Actions">
              <div className="DAT_Mobile_Report_Toolbar_Actions_DateGroup">
                <div className="DAT_Mobile_Report_DatePicker_Container">
                  <div
                    className="DAT_Mobile_Report_DatePicker"
                    onClick={() => {
                      setNavDate(new Date(selectedDate.getTime()));
                      setShowDropdown(!showDropdown);
                    }}
                  >
                    <span className="DAT_Mobile_Report_DatePicker_Value">
                      {formattedDateDisplay}
                    </span>
                    <LuCalendar className="DAT_Mobile_Report_DatePicker_Icon" />
                  </div>

                  {showDropdown && (
                    <>
                      <div
                        className="DAT_Mobile_Report_DatePicker_Backdrop"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="DAT_Mobile_Report_CalendarDropdown">
                        <div className="DAT_Mobile_Report_CalendarDropdown_Header">
                          <span className="DAT_Mobile_Report_CalendarDropdown_Header_Title">
                            {viewMode === "day" ? (
                              <>
                                {lang.locale === "vi"
                                  ? `Tháng ${monthNamesVi[navDate.getMonth()]} ${navDate.getFullYear()}`
                                  : `${monthNamesEn[navDate.getMonth()]} ${navDate.getFullYear()}`}{" "}
                                ▾
                              </>
                            ) : (
                              navDate.getFullYear()
                            )}
                          </span>
                          <div className="DAT_Mobile_Report_CalendarDropdown_Header_Nav">
                            <button
                              type="button"
                              className="DAT_Mobile_Report_CalendarDropdown_Header_Nav_Btn"
                              onClick={
                                viewMode === "day"
                                  ? handlePrevMonth
                                  : handlePrevYear
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="DAT_Mobile_Report_CalendarDropdown_Header_Nav_Btn"
                              onClick={
                                viewMode === "day"
                                  ? handleNextMonth
                                  : handleNextYear
                              }
                            >
                              ↓
                            </button>
                          </div>
                        </div>

                        {viewMode === "day" ? (
                          <>
                            <div className="DAT_Mobile_Report_CalendarDropdown_Weekdays">
                              {lang.locale === "vi" ? (
                                <>
                                  <div>H</div>
                                  <div>B</div>
                                  <div>T</div>
                                  <div>N</div>
                                  <div>S</div>
                                  <div>B</div>
                                  <div>C</div>
                                </>
                              ) : (
                                <>
                                  <div>M</div>
                                  <div>T</div>
                                  <div>W</div>
                                  <div>T</div>
                                  <div>F</div>
                                  <div>S</div>
                                  <div>S</div>
                                </>
                              )}
                            </div>
                            <div className="DAT_Mobile_Report_CalendarDropdown_DaysGrid">
                              {getDaysInMonth().map((cell, idx) => {
                                const isActive =
                                  cell.isCurrentMonth &&
                                  cell.date.getDate() ===
                                    selectedDate.getDate() &&
                                  cell.date.getMonth() ===
                                    selectedDate.getMonth() &&
                                  cell.date.getFullYear() ===
                                    selectedDate.getFullYear();
                                return (
                                  <div
                                    key={idx}
                                    className={`DAT_Mobile_Report_CalendarDropdown_DaysGrid_Cell ${cell.isCurrentMonth ? "CurrentMonth" : "PrevNextMonth"} ${isActive ? "Active" : ""}`}
                                    onClick={() =>
                                      cell.isCurrentMonth &&
                                      handleSelectDay(cell.date)
                                    }
                                  >
                                    {cell.day}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="DAT_Mobile_Report_CalendarDropdown_MonthsGrid">
                            {(lang.locale === "vi"
                              ? shortMonthNamesVi
                              : shortMonthNamesEn
                            ).map((mName, idx) => {
                              const isActive =
                                idx === selectedDate.getMonth() &&
                                navDate.getFullYear() ===
                                  selectedDate.getFullYear();
                              return (
                                <div
                                  key={idx}
                                  className={`DAT_Mobile_Report_CalendarDropdown_MonthsGrid_Cell ${isActive ? "Active" : ""}`}
                                  onClick={() => handleSelectMonth(idx)}
                                >
                                  {mName}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="DAT_Mobile_Report_CalendarDropdown_Footer">
                          <button
                            type="button"
                            className="DAT_Mobile_Report_CalendarDropdown_Footer_Btn"
                            onClick={handleClear}
                          >
                            {lang.locale === "vi" ? "Xóa" : "Clear"}
                          </button>
                          <button
                            type="button"
                            className="DAT_Mobile_Report_CalendarDropdown_Footer_Btn"
                            onClick={handleSelectToday}
                          >
                            {viewMode === "day"
                              ? lang.locale === "vi"
                                ? "Hôm nay"
                                : "Today"
                              : lang.locale === "vi"
                                ? "Tháng này"
                                : "This Month"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="DAT_Mobile_Report_Toggle">
                  <button
                    type="button"
                    className={`DAT_Mobile_Report_Toggle_Btn ${viewMode === "day" ? "Active" : ""}`}
                    onClick={() => setViewMode("day")}
                  >
                    {lang.formatMessage({ id: "day" })}
                  </button>
                  <button
                    type="button"
                    className={`DAT_Mobile_Report_Toggle_Btn ${viewMode === "month" ? "Active" : ""}`}
                    onClick={() => setViewMode("month")}
                  >
                    {lang.formatMessage({ id: "month" })}
                  </button>
                </div>
              </div>

              {/* <button className="DAT_Report_Toolbar_Actions_ImportExcel">{lang.formatMessage({ id: "import_excel" })}</button> */}
              {/* <button className="DAT_Report_Toolbar_Actions_Excel">
                {lang.formatMessage({ id: "export_excel" })}
              </button> */}
            </div>
          </div>

          <div className="DAT_Mobile_Report_Stat">
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "total_charge" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {summary.charge} kWh
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "total_discharge" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {summary.discharge} kWh
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "round_trip" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {avgEfficiency}%
              </span>
            </div>

            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({
                  id: "dashboard_chart_series_grid_import",
                })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {summary.gridImport} kWh
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "grid_export" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {summary.gridExport} kWh
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "load_consumption" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {summary.load} kWh
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "cycle_count" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                {summary.cycles}
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "cost_saving" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                ${costSaving}
              </span>
            </div>
            <div className="DAT_Mobile_Report_Stat_Box">
              <span className="DAT_Mobile_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "revenue" })}
              </span>
              <span className="DAT_Mobile_Report_Stat_Box_Value">
                ${revenue}
              </span>
            </div>
          </div>

          <div className="DAT_Mobile_Report_Chart">
            <div className="DAT_Mobile_Report_Chart_Container">
              <div className="DAT_Mobile_Report_Chart_Container_Header">
                {lang.formatMessage({ id: "charge" })} /{" "}
                {lang.formatMessage({ id: "discharge" })}
              </div>
              <div style={{ width: "100%", height: 280 }}>
                {isDayView ? (
                  <Line
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "charge" }),
                          data: chartRows.map((item) => item.charge),
                          borderColor: "rgba(27, 99, 184, 1)",
                          backgroundColor: "rgba(27, 99, 184, 1)",
                          fill: false,
                          tension: 0,
                        },
                        {
                          label: lang.formatMessage({ id: "discharge" }),
                          data: chartRows.map((item) => item.discharge),
                          borderColor: "rgba(255, 197, 61, 1)",
                          backgroundColor: "rgba(255, 197, 61, 1)",
                          fill: false,
                          tension: 0,
                        },
                      ],
                    }}
                    options={lineChartOptions}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "charge" }),
                          data: chartRows.map((item) => item.charge),
                          backgroundColor: "rgba(18, 144, 201, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                        {
                          label: lang.formatMessage({ id: "discharge" }),
                          data: chartRows.map((item) => item.discharge),
                          backgroundColor: "rgba(255, 197, 61, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                      ],
                    }}
                    options={barChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="DAT_Mobile_Report_Chart_Container">
              <div className="DAT_Mobile_Report_Chart_Container_Header">
                {lang.formatMessage({ id: "efficiency" })} /{" "}
                {lang.formatMessage({ id: "load_trend" })}
              </div>
              <div style={{ width: "100%", height: 280 }}>
                {isDayView ? (
                  <Line
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "efficiency" }),
                          data: chartRows.map((item) => item.efficiency),
                          borderColor: "rgba(33, 167, 53, 1)",
                          backgroundColor: "rgba(33, 167, 53, 1)",
                          fill: false,
                          tension: 0,
                        },
                        {
                          label: lang.formatMessage({ id: "load" }),
                          data: chartRows.map((item) => item.load),
                          borderColor: "rgba(245, 158, 11, 1)",
                          backgroundColor: "rgba(245, 158, 11, 1)",
                          fill: false,
                          tension: 0,
                        },
                      ],
                    }}
                    options={lineChartOptions}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "efficiency" }),
                          data: chartRows.map((item) => item.efficiency),
                          backgroundColor: "rgba(33, 167, 53, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                        {
                          label: lang.formatMessage({ id: "load" }),
                          data: chartRows.map((item) => item.load),
                          backgroundColor: "rgba(245, 158, 11, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                      ],
                    }}
                    options={barChartOptions}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="DAT_Mobile_Report_Detail">
            <div className="DAT_Mobile_Report_Detail_Header">
              <span className="DAT_Mobile_Report_Detail_Header_Title">
                {lang.formatMessage({ id: "detailed_report_table" })}
              </span>
            </div>
            {rows.length ? (
              <div className="DAT_Mobile_Report_Detail_Container">
                <table>
                  <thead>
                    <tr>
                      <th>{lang.formatMessage({ id: "date" })}</th>
                      <th>{lang.formatMessage({ id: "charge" })}</th>
                      <th>{lang.formatMessage({ id: "discharge" })}</th>
                      <th>
                        {lang.formatMessage({
                          id: "dashboard_chart_series_grid_import",
                        })}
                      </th>
                      <th>{lang.formatMessage({ id: "grid_export" })}</th>
                      <th>{lang.formatMessage({ id: "load" })}</th>
                      <th>{lang.formatMessage({ id: "efficiency" })}</th>
                      <th>{lang.formatMessage({ id: "cycle_count" })}</th>
                      <th>{lang.formatMessage({ id: "cost_saving" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={
                          viewMode === "day"
                            ? `${row.date}-${row.time}`
                            : row.date
                        }
                      >
                        <td>
                          {viewMode === "day"
                            ? formatHourLabel(row.time)
                            : formatToDayMonth(row.date)}
                        </td>
                        <td>{row.charge} kWh</td>
                        <td>{row.discharge} kWh</td>
                        <td>{row.gridImport} kWh</td>
                        <td>{row.gridExport} kWh</td>
                        <td>{row.load} kWh</td>
                        <td>{row.efficiency}%</td>
                        <td>{row.cycles}</td>
                        <td>${Math.round(row.discharge * 0.12)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="DAT_Report_Detail_Empty">
                <div className="DAT_Report_Detail_Empty_Icon">📭</div>
                <div className="DAT_Report_Detail_Empty_Text">
                  No report data
                </div>
                <div className="DAT_Report_Detail_Empty_Sub">
                  Try another time range.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="DAT_Report">
          <div className="DAT_Report_Toolbar">
            <div className="DAT_Report_Toolbar_Title">
              <LuChartNoAxesCombined />
              {lang.formatMessage({ id: "energy_report" })}
            </div>

            <div className="DAT_Report_Toolbar_Actions">
              <div className="DAT_Report_Toolbar_Actions_DateGroup">
                <div className="DAT_Report_DatePicker_Container">
                  <div
                    className="DAT_Report_DatePicker"
                    onClick={() => {
                      setNavDate(new Date(selectedDate.getTime()));
                      setShowDropdown(!showDropdown);
                    }}
                  >
                    <span className="DAT_Report_DatePicker_Value">
                      {formattedDateDisplay}
                    </span>
                    <LuCalendar className="DAT_Report_DatePicker_Icon" />
                  </div>

                  {showDropdown && (
                    <>
                      <div
                        className="DAT_Report_DatePicker_Backdrop"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="DAT_Report_CalendarDropdown">
                        <div className="DAT_Report_CalendarDropdown_Header">
                          <span className="DAT_Report_CalendarDropdown_Header_Title">
                            {viewMode === "day" ? (
                              <>
                                {lang.locale === "vi"
                                  ? `Tháng ${monthNamesVi[navDate.getMonth()]} ${navDate.getFullYear()}`
                                  : `${monthNamesEn[navDate.getMonth()]} ${navDate.getFullYear()}`}{" "}
                                ▾
                              </>
                            ) : (
                              navDate.getFullYear()
                            )}
                          </span>
                          <div className="DAT_Report_CalendarDropdown_Header_Nav">
                            <button
                              type="button"
                              className="DAT_Report_CalendarDropdown_Header_Nav_Btn"
                              onClick={
                                viewMode === "day"
                                  ? handlePrevMonth
                                  : handlePrevYear
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="DAT_Report_CalendarDropdown_Header_Nav_Btn"
                              onClick={
                                viewMode === "day"
                                  ? handleNextMonth
                                  : handleNextYear
                              }
                            >
                              ↓
                            </button>
                          </div>
                        </div>

                        {viewMode === "day" ? (
                          <>
                            <div className="DAT_Report_CalendarDropdown_Weekdays">
                              {lang.locale === "vi" ? (
                                <>
                                  <div>H</div>
                                  <div>B</div>
                                  <div>T</div>
                                  <div>N</div>
                                  <div>S</div>
                                  <div>B</div>
                                  <div>C</div>
                                </>
                              ) : (
                                <>
                                  <div>M</div>
                                  <div>T</div>
                                  <div>W</div>
                                  <div>T</div>
                                  <div>F</div>
                                  <div>S</div>
                                  <div>S</div>
                                </>
                              )}
                            </div>
                            <div className="DAT_Report_CalendarDropdown_DaysGrid">
                              {getDaysInMonth().map((cell, idx) => {
                                const isActive =
                                  cell.isCurrentMonth &&
                                  cell.date.getDate() ===
                                    selectedDate.getDate() &&
                                  cell.date.getMonth() ===
                                    selectedDate.getMonth() &&
                                  cell.date.getFullYear() ===
                                    selectedDate.getFullYear();
                                return (
                                  <div
                                    key={idx}
                                    className={`DAT_Report_CalendarDropdown_DaysGrid_Cell ${cell.isCurrentMonth ? "CurrentMonth" : "PrevNextMonth"} ${isActive ? "Active" : ""}`}
                                    onClick={() =>
                                      cell.isCurrentMonth &&
                                      handleSelectDay(cell.date)
                                    }
                                  >
                                    {cell.day}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="DAT_Report_CalendarDropdown_MonthsGrid">
                            {(lang.locale === "vi"
                              ? shortMonthNamesVi
                              : shortMonthNamesEn
                            ).map((mName, idx) => {
                              const isActive =
                                idx === selectedDate.getMonth() &&
                                navDate.getFullYear() ===
                                  selectedDate.getFullYear();
                              return (
                                <div
                                  key={idx}
                                  className={`DAT_Report_CalendarDropdown_MonthsGrid_Cell ${isActive ? "Active" : ""}`}
                                  onClick={() => handleSelectMonth(idx)}
                                >
                                  {mName}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="DAT_Report_CalendarDropdown_Footer">
                          <button
                            type="button"
                            className="DAT_Report_CalendarDropdown_Footer_Btn"
                            onClick={handleClear}
                          >
                            {lang.locale === "vi" ? "Xóa" : "Clear"}
                          </button>
                          <button
                            type="button"
                            className="DAT_Report_CalendarDropdown_Footer_Btn"
                            onClick={handleSelectToday}
                          >
                            {viewMode === "day"
                              ? lang.locale === "vi"
                                ? "Hôm nay"
                                : "Today"
                              : lang.locale === "vi"
                                ? "Tháng này"
                                : "This Month"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="DAT_Report_Toggle">
                  <button
                    type="button"
                    className={`DAT_Report_Toggle_Btn ${viewMode === "day" ? "Active" : ""}`}
                    onClick={() => setViewMode("day")}
                  >
                    {lang.formatMessage({ id: "day" })}
                  </button>
                  <button
                    type="button"
                    className={`DAT_Report_Toggle_Btn ${viewMode === "month" ? "Active" : ""}`}
                    onClick={() => setViewMode("month")}
                  >
                    {lang.formatMessage({ id: "month" })}
                  </button>
                </div>
              </div>

              {/* <button className="DAT_Report_Toolbar_Actions_ImportExcel">{lang.formatMessage({ id: "import_excel" })}</button> */}
              <button className="DAT_Report_Toolbar_Actions_Excel">
                {lang.formatMessage({ id: "export_excel" })}
              </button>
            </div>
          </div>

          <div className="DAT_Report_Stat">
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "total_charge" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {summary.charge} kWh
              </span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "total_discharge" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {summary.discharge} kWh
              </span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "round_trip" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {avgEfficiency}%
              </span>
            </div>

            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({
                  id: "dashboard_chart_series_grid_import",
                })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {summary.gridImport} kWh
              </span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "grid_export" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {summary.gridExport} kWh
              </span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "load_consumption" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {summary.load} kWh
              </span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "cycle_count" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">
                {summary.cycles}
              </span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "cost_saving" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">${costSaving}</span>
            </div>
            <div className="DAT_Report_Stat_Box">
              <span className="DAT_Report_Stat_Box_Label">
                {lang.formatMessage({ id: "revenue" })}
              </span>
              <span className="DAT_Report_Stat_Box_Value">${revenue}</span>
            </div>
          </div>

          <div className="DAT_Report_Chart">
            <div className="DAT_Report_Chart_Container">
              <div className="DAT_Report_Chart_Container_Header">
                {lang.formatMessage({ id: "charge" })} /{" "}
                {lang.formatMessage({ id: "discharge" })}
              </div>
              <div style={{ width: "100%", height: 280 }}>
                {isDayView ? (
                  <Line
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "charge" }),
                          data: chartRows.map((item) => item.charge),
                          borderColor: "rgba(27, 99, 184, 1)",
                          backgroundColor: "rgba(27, 99, 184, 1)",
                          fill: false,
                          tension: 0,
                        },
                        {
                          label: lang.formatMessage({ id: "discharge" }),
                          data: chartRows.map((item) => item.discharge),
                          borderColor: "rgba(255, 197, 61, 1)",
                          backgroundColor: "rgba(255, 197, 61, 1)",
                          fill: false,
                          tension: 0,
                        },
                      ],
                    }}
                    options={lineChartOptions}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "charge" }),
                          data: chartRows.map((item) => item.charge),
                          backgroundColor: "rgba(18, 144, 201, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                        {
                          label: lang.formatMessage({ id: "discharge" }),
                          data: chartRows.map((item) => item.discharge),
                          backgroundColor: "rgba(255, 197, 61, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                      ],
                    }}
                    options={barChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="DAT_Report_Chart_Container">
              <div className="DAT_Report_Chart_Container_Header">
                {lang.formatMessage({ id: "efficiency" })} /{" "}
                {lang.formatMessage({ id: "load_trend" })}
              </div>
              <div style={{ width: "100%", height: 280 }}>
                {isDayView ? (
                  <Line
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "efficiency" }),
                          data: chartRows.map((item) => item.efficiency),
                          borderColor: "rgba(33, 167, 53, 1)",
                          backgroundColor: "rgba(33, 167, 53, 1)",
                          fill: false,
                          tension: 0,
                        },
                        {
                          label: lang.formatMessage({ id: "load" }),
                          data: chartRows.map((item) => item.load),
                          borderColor: "rgba(245, 158, 11, 1)",
                          backgroundColor: "rgba(245, 158, 11, 1)",
                          fill: false,
                          tension: 0,
                        },
                      ],
                    }}
                    options={lineChartOptions}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: lang.formatMessage({ id: "efficiency" }),
                          data: chartRows.map((item) => item.efficiency),
                          backgroundColor: "rgba(33, 167, 53, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                        {
                          label: lang.formatMessage({ id: "load" }),
                          data: chartRows.map((item) => item.load),
                          backgroundColor: "rgba(245, 158, 11, 1)",
                          borderRadius: 0,
                          barThickness: 6,
                          maxBarThickness: 8,
                        },
                      ],
                    }}
                    options={barChartOptions}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="DAT_Report_Detail">
            <div className="DAT_Report_Detail_Header">
              <span className="DAT_Report_Detail_Header_Title">
                {lang.formatMessage({ id: "detailed_report_table" })}
              </span>
            </div>
            {rows.length ? (
              <div className="DAT_Report_Detail_Container">
                <table>
                  <thead>
                    <tr>
                      <th>{lang.formatMessage({ id: "date" })}</th>
                      <th>{lang.formatMessage({ id: "charge" })}</th>
                      <th>{lang.formatMessage({ id: "discharge" })}</th>
                      <th>
                        {lang.formatMessage({
                          id: "dashboard_chart_series_grid_import",
                        })}
                      </th>
                      <th>{lang.formatMessage({ id: "grid_export" })}</th>
                      <th>{lang.formatMessage({ id: "load" })}</th>
                      <th>{lang.formatMessage({ id: "efficiency" })}</th>
                      <th>{lang.formatMessage({ id: "cycle_count" })}</th>
                      <th>{lang.formatMessage({ id: "cost_saving" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={
                          viewMode === "day"
                            ? `${row.date}-${row.time}`
                            : row.date
                        }
                      >
                        <td>
                          {viewMode === "day"
                            ? formatHourLabel(row.time)
                            : formatToDayMonth(row.date)}
                        </td>
                        <td>{row.charge} kWh</td>
                        <td>{row.discharge} kWh</td>
                        <td>{row.gridImport} kWh</td>
                        <td>{row.gridExport} kWh</td>
                        <td>{row.load} kWh</td>
                        <td>{row.efficiency}%</td>
                        <td>{row.cycles}</td>
                        <td>${Math.round(row.discharge * 0.12)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="DAT_Report_Detail_Empty">
                <div className="DAT_Report_Detail_Empty_Icon">📭</div>
                <div className="DAT_Report_Detail_Empty_Text">
                  No report data
                </div>
                <div className="DAT_Report_Detail_Empty_Sub">
                  Try another time range.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
