import React, { useEffect, useState } from "react";
import "./SystemSettings.scss";
import { useIntl } from "react-intl";
import { LuSettings } from "react-icons/lu";
import { callApi } from "../../Api/Api";
import Modal from 'react-modal';
import { MdAdd } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { isMobile } from "react-device-detect";

const tabs = ["shedule", "solar"];
const tabLabels = {
  shedule: "shedule",
  solar: "solar",
};


export default function SystemSettings() {
  const lang = useIntl();
  const [activeTab, setActiveTab] = useState("shedule");
  const [sheduleList, setSheduleList] = useState([]);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({ id: 0, mod: '', value: '' });

  const mod = {
    startTime: "startTime",
    endTime: "endTime",
    controlType: "controlType",
    power: "power",
    socLimit: "socLimit"
  }


  const Month = {
    m01: { id: "01", name: "January" },
    m02: { id: "02", name: "February" },
    m03: { id: "03", name: "March" },
    m04: { id: "04", name: "April" },
    m05: { id: "05", name: "May" },
    m06: { id: "06", name: "June" },
    m07: { id: "07", name: "July" },
    m08: { id: "08", name: "August" },
    m09: { id: "09", name: "September" },
    m10: { id: "10", name: "October" },
    m11: { id: "11", name: "November" },
    m12: { id: "12", name: "December" },
  }

  const handleMonth = async (month) => {
    setMonth(month);
    console.log(month)
    let data = await callApi("post", process.env.REACT_APP_API + "/data/getShedule", {
      deviceid: "N150FL4L2C072590",
      month: month
    });

    if (data.status === 'true') {
      console.log(data.data.shedule);
      setSheduleList(data.data.shedule);

    } else {
      setSheduleList([]);
      console.log("Failed to get data");
    }
  };

  useEffect(() => {
    handleMonth(month);
  }, []);


  const handleOpen = (event) => {
    event.preventDefault();
    setIsOpen(true);

    let d = document.getElementById(event.currentTarget.id);
    let value = d.innerHTML;

    console.log("edit", event.currentTarget.id, value);
    setSettings({
      id: event.currentTarget.id.split('_')[1],
      mod: event.currentTarget.id.split('_')[0],
      value: value
    })
  };

  const handleChange = async (event) => {
    event.preventDefault();
    console.log("change", settings.id, settings.mod, event.currentTarget.value);

    setSettings({
      ...settings,
      value: event.currentTarget.value
    })

  };

  const handleSave = async () => {


    let data = [...sheduleList];

    let index = data.findIndex(x => Number(x.id) === Number(settings.id));
    if (index !== -1) {
      data[index][settings.mod] = settings.value;
      let sh = await callApi("post", process.env.REACT_APP_API + "/data/updateShedule", {
        deviceid: "N150FL4L2C072590",
        month: month,
        shedule: data
      });
      // console.log(sh);
      if (sh.status === 'true') {
        setSheduleList([...sh.data.shedule]);
      } else {
        console.log("Failed to update data");
      }

    }

    setIsOpen(false);



  };


  const handleAdd = async (event) => {
    event.preventDefault();
    console.log("add", event.currentTarget.id);
    let id = parseInt(event.currentTarget.id) + 1;
    let newItem = {
      id: id,
      startTime: "00:00",
      endTime: "00:00",
      controlType: "Charging",
      socLimit: 0,
      power: 0
    }

    let data = [...sheduleList, newItem];

    let sh = await callApi("post", process.env.REACT_APP_API + "/data/updateShedule", {
      deviceid: "N150FL4L2C072590",
      month: month,
      shedule: data
    });
    // console.log(sh);
    if (sh.status === 'true') {
      setSheduleList([...sh.data.shedule]);
    } else {
      console.log("Failed to update data");
    }

  };

  const handleDelete = async (event) => {
    event.preventDefault();
    // console.log("delete", event.currentTarget.id);
    let data = [...sheduleList];
    let newData = data.filter(x => Number(x.id) !== Number(event.currentTarget.id));

    let sh = await callApi("post", process.env.REACT_APP_API + "/data/updateShedule", {
      deviceid: "N150FL4L2C072590",
      month: month,
      shedule: newData
    });
    // console.log(sh);
    if (sh.status === 'true') {
      setSheduleList([...sh.data.shedule]);
    } else {
      console.log("Failed to update data");
    }

    // console.log("delete", newData);
  };


  const closeModal = () => {
    setIsOpen(false);
  }



  return (
    <>
      {isMobile ? (
        <>
          <div className="DAT_SystemSettingsMobile">
            <div className="DAT_SystemSettingsMobile_HeaderCard">
              <div className="DAT_SystemSettingsMobile_HeaderCard_Main">
                <div className="DAT_SystemSettingsMobile_HeaderCard_Main_Icon">
                  <LuSettings size={25} />
                </div>
                <div className="DAT_SystemSettingsMobile_HeaderCard_Main_Title">
                  {lang.formatMessage({ id: "system_settings" })}
                </div>
              </div>
              {/* <div className="DAT_SystemSettings_HeaderCard_Actions">
          <button
            className="DAT_SystemSettings_HeaderCard_Actions_ResetButton"
            onClick={() => setSettings(createDefaultSettings())}
          >
            {lang.formatMessage({id: "reset_default"})}
          </button>
          <button className="DAT_SystemSettings_HeaderCard_Actions_SaveButton">
            {lang.formatMessage({id: "save_settings"})}
          </button>
        </div> */}
            </div>

            <div className="DAT_SystemSettingsMobile_Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={
                    activeTab === tab
                      ? "DAT_SystemSettingsMobile_Tabs_Active"
                      : "DAT_SystemSettingsMobile_Tabs_Normal"
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {lang.formatMessage({ id: tabLabels[tab] })}
                </button>
              ))}
            </div>


            <div className="DAT_SystemSettingsMobile_ContentCard">


              {(() => {
                switch (activeTab) {
                  case 'shedule':
                    return (<>
                      {/* <div className="DAT_SystemSettings_ContentCard_Month">
                        {Object.values(Month).map((m) => (
                          <div
                            key={m.id}
                            className="DAT_SystemSettings_ContentCard_Month_Item"
                            style={{ backgroundColor: month === m.id ? "#1890ff" : "#f0f0f0", color: month === m.id ? "#fff" : "#000" }}
                            onClick={() => handleMonth(m.id)}
                          >
                            {lang.formatMessage({ id: m.name })}
                          </div>
                        ))}
                      </div> */}

                      <select
                        className="DAT_SystemSettingsMobile_ContentCard_Month"
                        defaultValue={month}
                        onChange={(e) => handleMonth(e.target.value)}
                      >
                        {Object.values(Month).map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            className="DAT_SystemSettingsMobile_ContentCard_Month_Item"
                          >
                            {lang.formatMessage({ id: m.name })}
                          </option>
                        ))}
                      </select>
                      <div className="DAT_SystemSettingsMobile_ContentCard_Shedule">
                        <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header">
                          <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d1" >{lang.formatMessage({ id: "no" })}</div>
                          <di className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "startTime" })}</di>
                          <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "endTime" })}</div>
                          <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "controlType" })}</div>
                          <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "socLimit" })}</div>
                          <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "power" })}</div>
                          <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "edit" })}</div>
                        </div>
                        {sheduleList.length > 0 ?
                          sheduleList.map((shedule, idx) => (
                            <div key={shedule.id} className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item">
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d1"  >{idx + 1}</div>
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d" id={`startTime_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.startTime}</div>
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d" id={`endTime_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.endTime}</div>
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d" id={`controlType_${shedule.id}`} onClick={(e) => handleOpen(e)} style={{ color: shedule.controlType === "Charging" ? "green" : "red" }} >{shedule.controlType}</div>
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d" id={`socLimit_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.socLimit}</div>
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d" id={`power_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.power}</div>
                              <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Header_d">
                                <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d_edit1" id={shedule.id} onClick={(e) => handleDelete(e)} ><RiDeleteBin5Line size={16} color="white" /></div>
                                {idx === sheduleList.length - 1 ? <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d_edit2" id={shedule.id} onClick={(e) => handleAdd(e)} ><MdAdd size={16} color="white" /></div> : <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d_edit3" ></div>}
                              </div>
                            </div>
                          ))
                          :
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px", gap: "10px" }} key={"empty"} >

                            <div>{lang.formatMessage({ id: "Alert_1" })}</div>
                            <div className="DAT_SystemSettingsMobile_ContentCard_Shedule_Item_d_edit2" id={0} onClick={(e) => handleAdd(e)} ><MdAdd size={16} color="white" /></div>


                          </div>



                        }
                      </div>
                    </>)
                  default:
                    return <></>
                }
              })()}

            </div>

          </div>
          <Modal
            isOpen={isOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              },
              content: {
                top: "40%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
              },
            }}
            ariaHideApp={false}
            contentLabel="Shedule Modal"
          >

            <div className='DAT_ConfigMobile'>

              <div className='DAT_ConfigMobile_Title'>{lang.formatMessage({ id: settings?.mod || "status_pending" })}</div>

              {(() => {
                switch (settings.mod) {
                  case 'startTime':
                    return <>
                      <input id="startTime_inp" type="time" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  case 'endTime':
                    return <>
                      <input id="endTime_inp" type="time" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  case 'controlType':
                    return <>
                      <select id="controlType_inp" defaultValue={settings.value} onChange={(e) => handleChange(e)}>
                        <option value="Charging">Charging</option>
                        <option value="Discharging">Discharging</option>
                      </select>
                    </>
                  case 'power':
                    return <>
                      <input id="power_inp" type="number" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  case 'socLimit':
                    return <>
                      <input id="socLimit_inp" type="number" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  default:
                    return <></>
                }
              })()}
              <div className='DAT_ConfigMobile_Close' onClick={() => handleSave()} >{lang.formatMessage({ id: "saveclose" })}</div>
            </div>
          </Modal >
        </>
      ) : (
        <>
          <div className="DAT_SystemSettings">
            <div className="DAT_SystemSettings_HeaderCard">
              <div className="DAT_SystemSettings_HeaderCard_Main">
                <div className="DAT_SystemSettings_HeaderCard_Main_Icon">
                  <LuSettings size={25} />
                </div>
                <div className="DAT_SystemSettings_HeaderCard_Main_Title">
                  {lang.formatMessage({ id: "system_settings" })}
                </div>
              </div>
              {/* <div className="DAT_SystemSettings_HeaderCard_Actions">
          <button
            className="DAT_SystemSettings_HeaderCard_Actions_ResetButton"
            onClick={() => setSettings(createDefaultSettings())}
          >
            {lang.formatMessage({id: "reset_default"})}
          </button>
          <button className="DAT_SystemSettings_HeaderCard_Actions_SaveButton">
            {lang.formatMessage({id: "save_settings"})}
          </button>
        </div> */}
            </div>

            <div className="DAT_SystemSettings_Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={
                    activeTab === tab
                      ? "DAT_SystemSettings_Tabs_Active"
                      : "DAT_SystemSettings_Tabs_Normal"
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {lang.formatMessage({ id: tabLabels[tab] })}
                </button>
              ))}
            </div>


            <div className="DAT_SystemSettings_ContentCard">


              {(() => {
                switch (activeTab) {
                  case 'shedule':
                    return (<>
                      <div className="DAT_SystemSettings_ContentCard_Month">
                        {Object.values(Month).map((m) => (
                          <div
                            key={m.id}
                            className="DAT_SystemSettings_ContentCard_Month_Item"
                            style={{ backgroundColor: month === m.id ? "#1890ff" : "#f0f0f0", color: month === m.id ? "#fff" : "#000" }}
                            onClick={() => handleMonth(m.id)}
                          >
                            {lang.formatMessage({ id: m.name })}
                          </div>
                        ))}
                      </div>
                      <div className="DAT_SystemSettings_ContentCard_Shedule">
                        <div className="DAT_SystemSettings_ContentCard_Shedule_Header">
                          <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d1" >{lang.formatMessage({ id: "no" })}</div>
                          <di className="DAT_SystemSettings_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "startTime" })}</di>
                          <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "endTime" })}</div>
                          <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "controlType" })}</div>
                          <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "socLimit" })}</div>
                          <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "power" })}</div>
                          <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d">{lang.formatMessage({ id: "edit" })}</div>
                        </div>
                        {sheduleList.length > 0 ?
                          sheduleList.map((shedule, idx) => (
                            <div key={shedule.id} className="DAT_SystemSettings_ContentCard_Shedule_Item">
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d1"  >{idx + 1}</div>
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d" id={`startTime_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.startTime}</div>
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d" id={`endTime_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.endTime}</div>
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d" id={`controlType_${shedule.id}`} onClick={(e) => handleOpen(e)} style={{ color: shedule.controlType === "Charging" ? "green" : "red" }} >{shedule.controlType}</div>
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d" id={`socLimit_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.socLimit}</div>
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d" id={`power_${shedule.id}`} onClick={(e) => handleOpen(e)} >{shedule.power}</div>
                              <div className="DAT_SystemSettings_ContentCard_Shedule_Header_d">
                                <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d_edit1" id={shedule.id} onClick={(e) => handleDelete(e)} ><RiDeleteBin5Line size={16} color="white" /></div>
                                {idx === sheduleList.length - 1 ? <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d_edit2" id={shedule.id} onClick={(e) => handleAdd(e)} ><MdAdd size={16} color="white" /></div> : <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d_edit3" ></div>}
                              </div>
                            </div>
                          ))
                          :
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px", gap: "10px" }} key={"empty"} >

                            <div>{lang.formatMessage({ id: "Alert_1" })}</div>
                            <div className="DAT_SystemSettings_ContentCard_Shedule_Item_d_edit2" id={0} onClick={(e) => handleAdd(e)} ><MdAdd size={16} color="white" /></div>


                          </div>



                        }
                      </div>
                    </>)
                  default:
                    return <></>
                }
              })()}

            </div>

          </div>
          <Modal
            isOpen={isOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              },
              content: {
                top: "40%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
              },
            }}
            ariaHideApp={false}
            contentLabel="Shedule Modal"
          >

            <div className='DAT_Config'>

              <div className='DAT_Config_Title'>{lang.formatMessage({ id: settings?.mod || "status_pending" })}</div>

              {(() => {
                switch (settings.mod) {
                  case 'startTime':
                    return <>
                      <input id="startTime_inp" type="time" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  case 'endTime':
                    return <>
                      <input id="endTime_inp" type="time" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  case 'controlType':
                    return <>
                      <select id="controlType_inp" defaultValue={settings.value} onChange={(e) => handleChange(e)}>
                        <option value="Charging">Charging</option>
                        <option value="Discharging">Discharging</option>
                      </select>
                    </>
                  case 'power':
                    return <>
                      <input id="power_inp" type="number" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  case 'socLimit':
                    return <>
                      <input id="socLimit_inp" type="number" defaultValue={settings.value} onChange={(e) => handleChange(e)} />
                    </>
                  default:
                    return <></>
                }
              })()}
              <div className='DAT_Config_Close' onClick={() => handleSave()} >{lang.formatMessage({ id: "saveclose" })}</div>
            </div>
          </Modal >
        </>
      )}
    </>
  );
}
