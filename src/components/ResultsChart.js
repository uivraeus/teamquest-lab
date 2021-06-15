import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./ResultsChart.css";

//TODO/TBD: Add any "safety nets"? Now, I just assume that all results
//have the same values.length and that this also match colors and labels.
const ResultsChart = ({ results, maxVal, colors, labels }) => {
  //Transform the input (list of "result objects" with shape {meta, maturity, ...})
  //into four separate series to match the API for ScatterChart/Scatter.
  //(i.e. list of pairs of date (x-axis) and score (y-axis))
  //Also, create a separate "meta-series" which is used to populate the custom
  //tooltip for when clicking on the "actual" series sample points in the plot.

  //NOTE: we don't do any "filtering" on completion level or similar here as
  //that is the responsibility of the parent, i.e. just try to plot everything.
  const meta = results.map((result) => ({
    date: result.meta.createTime,
    numResponders: result.meta.numResponders
  }));

  //Helper for extracting a,b,c,d series
  const createSeries = (analysisIndex) => {
    return results.map((result, index) => ({
      date: meta[index].date,
      value: result.maturity[analysisIndex],
      refIx: index,
      label: labels[analysisIndex],
    }));
  };

  const aData = createSeries(0);
  const bData = createSeries(1);
  const cData = createSeries(2);
  const dData = createSeries(3);

  //Helpers for configuring the x-axis
  const oldest = meta[0].date;
  const now = new Date().getTime();

  //Helper component for rendering the "tooltip"; We want to display survey meta-data
  //rather than (only) the number already shown in the chart
  const CustomTooltip = ({ payload }) => {
    if (!payload || !payload.length) return null;
    const ix = payload[0].payload.refIx;
    const n = meta[ix].numResponders;
    const dateStr = new Date(meta[ix].date).toLocaleDateString();
    const rspStr = `${n} responder` + (n !== 1 ? "s" : "");
    const label = payload[1].payload.label;
    const valueStr = `${label}: ${payload[1].value}`;
    return (
      <div className="ResultsChart-tooltip">
        <p>
          <b>{dateStr}</b>
          <em> ({rspStr})</em>
        </p>
        <p>{valueStr}</p>
      </div>
    );
  };

  //TODO: Improve XAxis tick alignment and layout
  //Now I have a ScatterChart left margin of -35 to not waste so much space on that side
  //but that also means that the first tick's label is lost
  return (
    <div className="ResultsChart">
      <ResponsiveContainer minWidth={360} minHeight={200}>
        <ScatterChart margin={{ top: 10, right: 0, bottom: 0, left: -27 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            domain={[oldest, now]}
            type="number"
            dataKey="date"
            name="Date"
            ticks={meta.map(m => m.date)}
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis domain={[0, maxVal]} dataKey="value" name="Score" />
          <Tooltip
            wrapperStyle={{
              boxShadow: "2px 2px 3px 0px rgb(204, 204, 204)",
            }}
            content={<CustomTooltip />}
          />

          <Scatter
            line
            lineJointType="monotoneX"
            shape="circle"
            data={aData}
            fill={colors[0]}
            strokeWidth={2}
          />
          <Scatter
            line
            lineJointType="monotoneX"
            shape="circle"
            data={bData}
            fill={colors[1]}
            strokeWidth={2}
          />
          <Scatter
            line
            lineJointType="monotoneX"
            shape="circle"
            data={cData}
            fill={colors[2]}
            strokeWidth={2}
          />
          <Scatter
            line
            lineJointType="monotoneX"
            shape="circle"
            data={dData}
            fill={colors[3]}
            strokeWidth={2}
          />
          
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;
