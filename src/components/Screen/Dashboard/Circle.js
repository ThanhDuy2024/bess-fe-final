import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { BarElement, ArcElement, CategoryScale, Chart, Filler, Legend, LinearScale, LineElement, PointElement, scales, Title, Tooltip } from 'chart.js';
import ChartDataLables from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { signal } from "@preact/signals-react";
import { callApi } from "../../Api/Api";
import moment from "moment-timezone";
import { useSignals } from "@preact/signals-react/runtime";
const verticalCrosshairPlugin = {
  id: 'verticalCrosshair',

  afterEvent(chart, args) {
    const { event } = args;

    if (event.type === 'mousemove') {
      chart.$crosshairX = event.x;
      chart.draw();
    }

    if (event.type === 'mouseout') {
      chart.$crosshairX = null;
      chart.draw();
    }
  },

  afterDraw(chart) {
    const x = chart.$crosshairX;
    if (x == null) return;

    const { ctx, chartArea } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#999';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  },
};
Chart.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartDataLables, Title, Tooltip, Filler, Legend, zoomPlugin, annotationPlugin, verticalCrosshairPlugin);

const labelPie = signal([]);
const datasetPie = signal([]);
const totalChart = signal(0);

const Circle = () => {
  useSignals();
  const lang = useIntl();

  let data_tempPie = {
    type: 'doughnut',
    labels: labelPie.value,
    datasets: datasetPie.value
  }

  let optionPie = {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        type: 'line',
        color: 'white',
        font: {
          size: 18,
          weight: 'bold'
        },
        formatter: (value, context) => {
          return (value * 100 / (totalChart.value)).toFixed(1) + ' %';
        },
      },
    },
  }

  useEffect(() => {
    (async () => {
      totalChart.value = 10000;
      labelPie.value = ['Battery', 'Grid'];
      datasetPie.value = [
        {
          backgroundColor: ['rgb(8, 72, 246)', 'rgb(255, 68, 68)'],
          borderColor: ['rgb(85, 123, 213)', 'rgb(255, 68, 68)'],
          borderWidth: 1,
          data: [3111, 6889],
        }
      ];
    })();
  }, []);

  return (
    <div className="DAT_Power_Donut_Card">
      <div className="DAT_Power_Donut_Card_Header">
        <div>
          <span className="DAT_Power_Donut_Card_Header_Title">
            {lang.formatMessage({ id: "dashboard_donut_title" })}
          </span>
        </div>
      </div>

      <div className="DAT_Power_Donut_Chart_Wrap">
        <Doughnut data={data_tempPie} options={optionPie} />

        {/* <div className="DAT_Power_Donut_Center">
          <div className="DAT_Power_Donut_Center_Value">
            <div className="DAT_Power_Donut_Center_Value_Val">{10}</div>
          </div>
          <div className="DAT_Power_Donut_Center_Label">
            {lang.formatMessage({ id: "dashboard_donut_total_load" })}
          </div>
        </div> */}
      </div>

      <div className="DAT_Power_Donut_Legend">

        <div className="DAT_Power_Donut_Legend_Item" >
          <span
            className="DAT_Power_Donut_Legend_Item_Dot"
            style={{ background: '#0848F6' }}
          />
          <span className="DAT_Power_Donut_Legend_Name">{'Battery'}</span>
          <div className="DAT_Power_Donut_Legend_Value">
            <div className="DAT_Power_Donut_Legend_Value_Val">{3111}</div>
            <div className="DAT_Power_Donut_Legend_Value_Unit">kWh</div>
          </div>
        </div>

        <div className="DAT_Power_Donut_Legend_Item" >
          <span
            className="DAT_Power_Donut_Legend_Item_Dot"
            style={{ background: '#FF4444' }}
          />
          <span className="DAT_Power_Donut_Legend_Name">{'Grid'}</span>
          <div className="DAT_Power_Donut_Legend_Value">
            <div className="DAT_Power_Donut_Legend_Value_Val">{6889}</div>
            <div className="DAT_Power_Donut_Legend_Value_Unit">kWh</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Circle;
