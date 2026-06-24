import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapChart = ({ data }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  // data comes as [{ name: "US", value: 5000 }, { name: "IN", value: 3000 }]
  const maxValue = Math.max(...(data || []).map(d => d.value), 1);
  
  const colorScale = scaleLinear()
    .domain([0, maxValue])
    .range(["#1a1a1a", "#ec4899"]); // From dark grey to neon pink

  return (
    <div className="w-full h-full relative" data-tooltip-id="my-tooltip">
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 100 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // geo.id is the ISO code in the world-atlas data
              const d = data?.find((s) => s.name === geo.id || s.name === geo.properties.iso_a2);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    const name = geo.properties.name || "Unknown Region";
                    setTooltipContent(`${name}: ${d ? d.value : 0} HITS`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  fill={d ? colorScale(d.value) : "#111111"}
                  stroke="#333"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "all 250ms" },
                    hover: { fill: "#f472b6", outline: "none", cursor: "crosshair", stroke: "#fff", strokeWidth: 1 },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Tooltip 
        id="my-tooltip" 
        content={tooltipContent} 
        style={{ 
            backgroundColor: 'rgba(9, 9, 11, 0.8)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            fontFamily: 'monospace',
            fontWeight: 'bold',
            zIndex: 1000
        }}
      />
    </div>
  );
};

export default MapChart;
