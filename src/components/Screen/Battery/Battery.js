import React, { useEffect, useState } from "react";
import { LuBadgeCheck, LuSearch, LuBatteryCharging, LuSeBatteryMobile} from "react-icons/lu";
import StatusBadge from "../../Modal/StatusBadge";
import { mockAlarms, mockContainers } from "../../data/mockData";
import "./Battery.scss";
import { FaArrowLeftLong } from "react-icons/fa6";
import { callApi } from "../../Api/Api";
import { socket } from "../../../App";
import { useIntl } from "react-intl";
import { isMobile } from "react-device-detect";
export default function Battery() {
  const [selectedContainer, setSelectedContainer] = useState(mockContainers[0]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [searchRack, setSearchRack] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModelModuleOpen, setIsModalModuleOpen] = useState(false);
  const [moduleName, setModuleName] = useState("")

  const filteredRacks = selectedContainer.racks.filter((r) => {
    const matchSearch = r.id.toLowerCase().includes(searchRack.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const lang = useIntl();
  const [dataInf, setDataInf] = useState({});
  const [step, setStep] = useState(0);

  const batteryStatus = {
    0: "Initialization",
    1: "Charging",
    2: "Discharging",
    3: "Ready",
    5: "Charge prohibition",
    6: "Discharge prohibition.",
    7: "Charging and discharging prohibition",
    8: "Fault",
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
      level: "bmslevel"
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
        level: "bmslevel",
      });

      // socket.value.emit("BESS_UNSUBSCRIBE_MANY", {
      //     levels: ["pcslevel", "bmslevel"],
      // });
      socket.value.off("BESS_DATA");
    };


  }, [step]);

  return (
    <>
      {isMobile ? (
        <div className="DAT_BatteryMobile">
          <div className="DAT_BatteryMobile_Overview">
            {mockContainers.map((c) => (
              <div
                key={c.id}
                className={`DAT_BatteryMobile_Overview_Card`}
                onClick={() => {
                  setSelectedContainer(c);
                  setSelectedRack(null);
                }}
              >
                <div className="DAT_BatteryMobile_Overview_Card_Header">
                  <div className="DAT_BatteryMobile_Overview_Card_Header_BoxTitle">
                    <div className="DAT_BatteryMobile_Overview_Card_Header_BoxTitle_Title">
                      <div className="DAT_BatteryMobile_Overview_Card_Header_BoxTitle_Title_Icon">
                        <LuBatteryCharging size={40} />
                      </div>
                      <div className="DAT_BatteryMobile_Overview_Card_Header_BoxTitle_Title_Label">{lang.formatMessage({id: "bms_level"})}</div>
                    </div>
                    <StatusBadge status={batteryStatus[parseInt(dataInf?.['43-1'])] ?? 0} />
                  </div>

                  <div className="DAT_BatteryMobile_Overview_Card_Header_Box">
                    <div className="DAT_BatteryMobile_Overview_Card_Header_Box_Item">
                      <div className="DAT_BatteryMobile_Overview_Card_Header_Box_Item_Label">SoC:</div>
                      <div className="DAT_BatteryMobile_Overview_Card_Header_Box_Item_Value">{parseInt(dataInf?.['4-1']) || 0}%</div>
                    </div>

                    <div className="DAT_BatteryMobile_Overview_Card_Header_Box_Item">
                      <div className="DAT_BatteryMobile_Overview_Card_Header_Box_Item_Label">SoH:</div>
                      <div className="DAT_BatteryMobile_Overview_Card_Header_Box_Item_Value">{parseInt(dataInf?.['5-1']) || 0}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="DAT_BatteryMobile_RackList">
            <div className="DAT_BatteryMobile_RackList_Header">
              <span className="DAT_BatteryMobile_RackList_Header_Title">
                {lang.formatMessage({id: "bms_rack_list"})}
              </span>
              <div className="DAT_BatteryMobile_RackList_Filter">
                <select
                  className="DAT_BatteryMobile_RackList_Filter_Select"
                  style={{ width: 130, height: 36 }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">{lang.formatMessage({id: "bms_all_status"})}</option>
                  <option value="Normal">{lang.formatMessage({id: "bms_status_normal"})}</option>
                  <option value="Warning">{lang.formatMessage({id: "bms_status_warning"})}</option>
                  <option value="Fault">{lang.formatMessage({id: "bms_status_fault"})}</option>
                </select>
              </div>
            </div>
            <div className="DAT_BatteryMobile_RackList_Table">
              <table className="DAT_BatteryMobile_RackList_Table_Main">
                <thead className="DAT_BatteryMobile_RackList_Table_Main_Head">
                  <tr>
                    <th className="DAT_BatteryMobile_RackList_Table_Main_Head_Th">Rack</th>
                    <th className="DAT_BatteryMobile_RackList_Table_Main_Head_Th"> {lang.formatMessage({ id: "bms_status" })}</th>
                  </tr>
                </thead>
                <tbody className="DAT_BatteryMobile_RackList_Table_Main_Body">
                  {filteredRacks.map((r) => (
                    <tr
                      key={r.id}
                      className={`DAT_BatteryMobile_RackList_Table_Main_Body_Row ${selectedRack?.id === r.id ? "DAT_Battery_RackList_Table_Main_Body_Row--selected" : ""} ${r.status === "Warning" ? "DAT_Battery_RackList_Table_Main_Body_Row--warning" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedRack(r);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="DAT_BatteryMobile_RackList_Table_Main_Body_Row_Cell DAT_Battery_RackList_Table_Main_Body_Row_Cell--medium">{r.id}</td>
                      <td className="DAT_BatteryMobile_RackList_Table_Main_Body_Row_Cell">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isModalOpen && selectedRack && (
            <div className="DAT_ModalMobile_Overlay" onClick={() => setIsModalOpen(false)}>
              <div
                className="DAT_ModalMobile_Overlay_Box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="DAT_ModalMobile_Overlay_Box_Header">
                  <h2>{selectedRack.id} - {lang.formatMessage({id: "bms_rack_detail"})}</h2>
                </div>

                {/* KPI GRID */}
                <div className="DAT_ModalMobile_Overlay_Box_Grid">

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">SOC:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.soc}%</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">SOH:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.soh}%</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_temp"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.temperature}°C</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_max_temp_normal"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.maxTemp}°C</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_min_cell"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.minCellV}</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_max_cell"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.maxCellV}</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_voltage"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.voltage}V</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_current"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.current}A</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_cycles"})}:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.cycles}</span>
                  </div>

                  <div className="DAT_ModalMobile_Overlay_Box_Grid_Card">
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Label">DeltaV:</span>
                    <span className="DAT_ModalMobile_Overlay_Box_Grid_Card_Value">{selectedRack.deltaV}</span>
                  </div>

                </div>

                <div className="DAT_ModalMobile_Overlay_Box_Module">
                  {selectedRack.module.map((m) => {
                    return (
                      <div className="DAT_ModalMobile_Overlay_Box_Module_Card" onClick={() => {
                        setIsModalOpen(false)
                        setIsModalModuleOpen(true)
                        setModuleName(m)
                      }}>
                        <span className="DAT_ModalMobile_Overlay_Box_Module_Card_Value">{m}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="DAT_ModalMobile_Overlay_Box_Footer">
                  <button onClick={() => setIsModalOpen(false)}>{lang.formatMessage({id: "bms_close"})}</button>
                </div>
              </div>
            </div>
          )}

          {isModelModuleOpen && selectedRack && (
            <div className="DAT_ModalMobile_Overlay" onClick={() => setIsModalModuleOpen(false)}>
              <div
                className="DAT_ModalMobile_Overlay_BoxCell"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="DAT_ModalMobile_Overlay_BoxCell_Header">
                  <div className="DAT_ModalMobile_Overlay_BoxCell_Header_Back" onClick={() => {
                    setIsModalModuleOpen(false)
                    setIsModalOpen(true)
                  }}>
                    <div className="DAT_ModalMobile_Overlay_BoxCell_Header_Back_Icon">
                      <FaArrowLeftLong size={20} />
                    </div>
                    <h2>{selectedRack.id} - {moduleName} - Cells</h2>
                  </div>
                  <button
                    className="DAT_ModalMobile_Overlay_BoxCell_Header_Close"
                    onClick={() => setIsModalModuleOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="DAT_ModalMobile_Overlay_BoxCell_Cell">
                  {selectedRack.cells.map((cell) => {
                    return (
                      <div className={cell.status === "Normal" ? `DAT_Modal_Overlay_BoxCell_Cell_Card` : "DAT_Modal_Overlay_BoxCell_Cell_Card--High"}>
                        <div className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Header">
                          <span className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Header_Title">{cell.id}</span>
                          <div className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Header_Status">
                            <span className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Header_Status_Label">{lang.formatMessage({id: "bms_status"})}:</span>
                            <span className={cell.status === "Normal" ? `DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Header_Status_Value` : "DAT_Modal_Overlay_BoxCell_Cell_Card_Header_Status_Value_High"}>{lang.formatMessage({id: `bms_status_${cell.status.toLowerCase()}`})}</span>
                          </div>
                        </div>
                        <div className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Stats">
                          <div className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Stats_Item">
                            <span className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Stats_Item_Label">{lang.formatMessage({id: "bms_voltage"})}:</span>
                            <span className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Stats_Item_Value">{cell.voltage}V</span>
                          </div>
                          <div className="">
                            <span className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Stats_Item_Label">{lang.formatMessage({id: "bms_temp"})}:</span>
                            <span className="DAT_ModalMobile_Overlay_BoxCell_Cell_Card_Stats_Item_Value">{cell.temperature}°C</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="DAT_Battery">
          <div className="DAT_Battery_Overview">
            {mockContainers.map((c) => (
              <div
                key={c.id}
                className={`DAT_Battery_Overview_Card`}
                onClick={() => {
                  setSelectedContainer(c);
                  setSelectedRack(null);
                }}
              >
                <div className="DAT_Battery_Overview_Card_Header">
                  <div className="DAT_Battery_Overview_Card_Header_BoxTitle">
                    <div className="DAT_Battery_Overview_Card_Header_BoxTitle_Title">
                      <div className="DAT_Battery_Overview_Card_Header_BoxTitle_Title_Icon">
                        <LuBatteryCharging size={40} />
                      </div>
                      <div className="DAT_Battery_Overview_Card_Header_BoxTitle_Title_Label">{lang.formatMessage({id: "bms_level"})}</div>
                    </div>
                    <StatusBadge status={batteryStatus[parseInt(dataInf?.['43-1'])] ?? 0} />
                  </div>

                  <div className="DAT_Battery_Overview_Card_Header_Box">
                    <div className="DAT_Battery_Overview_Card_Header_Box_Item">
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Label">SoC:</div>
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Value">{parseInt(dataInf?.['4-1']) || 0}%</div>
                    </div>

                    <div className="DAT_Battery_Overview_Card_Header_Box_Item">
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Label">SoH:</div>
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Value">{parseInt(dataInf?.['5-1']) || 0}%</div>
                    </div>

                    <div className="DAT_Battery_Overview_Card_Header_Box_Item">
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Label">{lang.formatMessage({id: "bms_max_temp"})}:</div>
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Value">{parseFloat(dataInf?.['12-1']) - 40}°C</div>
                    </div>
                    <div className="DAT_Battery_Overview_Card_Header_Box_Item">
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Label">{lang.formatMessage({id: "bms_min_temp"})}:</div>
                      <div className="DAT_Battery_Overview_Card_Header_Box_Item_Value">{parseFloat(dataInf?.['15-1']) - 40}°C</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="DAT_Battery_RackList">
            <div className="DAT_Battery_RackList_Header">
              <span className="DAT_Battery_RackList_Header_Title">
                {lang.formatMessage({id: "bms_rack_list"})}
              </span>
              <div className="DAT_Battery_RackList_Filter">
                <div className="DAT_Battery_RackList_Filter_Search" style={{ width: 180 }}>
                  <span className="DAT_Battery_RackList_Filter_Search_Icon">
                    <LuSearch />
                  </span>
                  <input
                    className="DAT_Battery_RackList_Filter_Search_Input"
                    style={{ height: 36 }}
                    placeholder={lang.formatMessage({id: "bms_search"})}
                    value={searchRack}
                    onChange={(e) => setSearchRack(e.target.value)}
                  />
                </div>
                <select
                  className="DAT_Battery_RackList_Filter_Select"
                  style={{ width: 130, height: 36 }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">{lang.formatMessage({id: "bms_all_status"})}</option>
                  <option value="Normal">{lang.formatMessage({id: "bms_status_normal"})}</option>
                  <option value="Warning">{lang.formatMessage({id: "bms_status_warning"})}</option>
                  <option value="Fault">{lang.formatMessage({id: "bms_status_fault"})}</option>
                </select>
              </div>
            </div>
            <div className="DAT_Battery_RackList_Table">
              <table className="DAT_Battery_RackList_Table_Main">
                <thead className="DAT_Battery_RackList_Table_Main_Head">
                  <tr>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">Rack</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th"> {lang.formatMessage({ id: "bms_status" })}</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">{lang.formatMessage({id: "bms_voltage"})}</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">{lang.formatMessage({id: "bms_current"})}</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">SOC</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">SOH</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">{lang.formatMessage({id: "bms_temp"})}</th>
                    <th className="DAT_Battery_RackList_Table_Main_Head_Th">{lang.formatMessage({id: "bms_cycles"})}</th>
                  </tr>
                </thead>
                <tbody className="DAT_Battery_RackList_Table_Main_Body">
                  {filteredRacks.map((r) => (
                    <tr
                      key={r.id}
                      className={`DAT_Battery_RackList_Table_Main_Body_Row ${selectedRack?.id === r.id ? "DAT_Battery_RackList_Table_Main_Body_Row--selected" : ""} ${r.status === "Warning" ? "DAT_Battery_RackList_Table_Main_Body_Row--warning" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedRack(r);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell DAT_Battery_RackList_Table_Main_Body_Row_Cell--medium">{r.id}</td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">{r.voltage}V</td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">{r.current}A</td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">{r.soc}%</td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">{r.soh}%</td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">{r.temperature}°C</td>
                      <td className="DAT_Battery_RackList_Table_Main_Body_Row_Cell">{r.cycles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isModalOpen && selectedRack && lang && (
            <div className="DAT_Modal_Overlay" onClick={() => setIsModalOpen(false)}>
              <div
                className="DAT_Modal_Overlay_Box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="DAT_Modal_Overlay_Box_Header">
                  <h2>{selectedRack.id} - {lang.formatMessage({id: "bms_rack_detail"})}</h2>
                </div>

                {/* KPI GRID */}
                <div className="DAT_Modal_Overlay_Box_Grid">

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">SOC:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.soc}%</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">SOH:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.soh}%</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_temp"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.temperature}°C</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_max_temp"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.maxTemp}°C</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_min_cell"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.minCellV}</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_max_cell"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.maxCellV}</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_voltage"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.voltage}V</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_current"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.current}A</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">{lang.formatMessage({id: "bms_cycles"})}:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.cycles}</span>
                  </div>

                  <div className="DAT_Modal_Overlay_Box_Grid_Card">
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Label">DeltaV:</span>
                    <span className="DAT_Modal_Overlay_Box_Grid_Card_Value">{selectedRack.deltaV}</span>
                  </div>

                </div>

                <div className="DAT_Modal_Overlay_Box_Module">
                  {selectedRack.module.map((m) => {
                    return (
                      <div className="DAT_Modal_Overlay_Box_Module_Card" onClick={() => {
                        setIsModalOpen(false)
                        setIsModalModuleOpen(true)
                        setModuleName(m)
                      }}>
                        <span className="DAT_Modal_Overlay_Box_Module_Card_Value">{m}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="DAT_Modal_Overlay_Box_Footer">
                  <button onClick={() => setIsModalOpen(false)}>{lang.formatMessage({id: "bms_close"})}</button>
                </div>
              </div>
            </div>
          )}

          {isModelModuleOpen && selectedRack && (
            <div className="DAT_Modal_Overlay" onClick={() => setIsModalModuleOpen(false)}>
              <div
                className="DAT_Modal_Overlay_BoxCell"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="DAT_Modal_Overlay_BoxCell_Header">
                  <div className="DAT_Modal_Overlay_BoxCell_Header_Back" onClick={() => {
                    setIsModalModuleOpen(false)
                    setIsModalOpen(true)
                  }}>
                    <div className="DAT_Modal_Overlay_BoxCell_Header_Back_Icon">
                      <FaArrowLeftLong size={20} />
                    </div>
                    <h2>{selectedRack.id} - {moduleName} - Cells</h2>
                  </div>
                  <button
                    className="DAT_Modal_Overlay_BoxCell_Header_Close"
                    onClick={() => setIsModalModuleOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="DAT_Modal_Overlay_BoxCell_Cell">
                  {selectedRack.cells.map((cell) => {
                    return (
                      <div className={cell.status === "Normal" ? `DAT_Modal_Overlay_BoxCell_Cell_Card` : "DAT_Modal_Overlay_BoxCell_Cell_Card--High"}>
                        <div className="DAT_Modal_Overlay_BoxCell_Cell_Card_Header">
                          <span className="DAT_Modal_Overlay_BoxCell_Cell_Card_Header_Title">{cell.id}</span>
                          <div className="DAT_Modal_Overlay_BoxCell_Cell_Card_Header_Status">
                            <span className="DAT_Modal_Overlay_BoxCell_Cell_Card_Header_Status_Label">{lang.formatMessage({id: "bms_status"})}:</span>
                            <span className={cell.status === "Normal" ? `DAT_Modal_Overlay_BoxCell_Cell_Card_Header_Status_Value` : "DAT_Modal_Overlay_BoxCell_Cell_Card_Header_Status_Value_High"}>{lang.formatMessage({id: `bms_status_${cell.status.toLowerCase()}`})}</span>
                          </div>
                        </div>
                        <div className="DAT_Modal_Overlay_BoxCell_Cell_Card_Stats">
                          <div className="DAT_Modal_Overlay_BoxCell_Cell_Card_Stats_Item">
                            <span className="DAT_Modal_Overlay_BoxCell_Cell_Card_Stats_Item_Label">{lang.formatMessage({id: "bms_voltage"})}:</span>
                            <span className="DAT_Modal_Overlay_BoxCell_Cell_Card_Stats_Item_Value">{cell.voltage}V</span>
                          </div>
                          <div className="">
                            <span className="DAT_Modal_Overlay_BoxCell_Cell_Card_Stats_Item_Label">{lang.formatMessage({id: "bms_temp"})}:</span>
                            <span className="DAT_Modal_Overlay_BoxCell_Cell_Card_Stats_Item_Value">{cell.temperature}°C</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
