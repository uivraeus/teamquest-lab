import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label} from "recharts";

import "./ResultPie.css"

const ResultPie = ( {value, max, color="#D000E0", opacity="1.0", textColor="#000000" }) => {
  //Add a "void" entry to get a percentage aspect of the result 
  const data = [
    { name: "result", value },
    { name: "void", value: max-value }
  ]; 
  
  //Add two Pies, one as background without animation (the full circle)
  //and another with coloring according to value's percentage of max
  //The start/endAngle are adjusted so that the animation fills clockwise
  //starting from the top.
  //The stroke="" thing is just to get rid of the 1px gap between the
  //"result" and the "void" (which is filled with transparent color)
  return (
    <div className="ResultPie">
      <ResponsiveContainer minWidth={80} minHeight={80}>
        <PieChart>
          <Pie
            data={[{value:max}]}
            dataKey="value"
            innerRadius={"70%"}
            outerRadius={"100%"}
            isAnimationActive={false}
            fill="var(--color-result-void)"
            stroke=""
          />
          <Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            innerRadius={"70%"}
            outerRadius={"100%"}
            isAnimationActive={true}
            stroke=""
          >
            {data.map((entry, index) => (
              <Cell key={`slice-${index}`} fill={entry.name==="void" ? "#00000000": color} opacity={opacity}/>
            ))}
            <Label position="center" fill={textColor}>
              {`${value}`}
            </Label>
          </Pie>
        </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ResultPie;
