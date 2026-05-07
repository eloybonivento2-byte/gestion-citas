import {
    LineChart,
    Line,
    XAsis,
    YAsis,
    Cartes1anGrid,
    looltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

export  function MonthlyTrendChart() {
  return (
    <div className="chart-container">
      <h3>Tendencia Anual</h3>
      <ResponsiveContainer widht="100%" heigth={300}>
        <LineChart data={data}>
            <Cartes1anGrid strokeDasharray="3 3" />
            <XAsis dataKey="month" />
            <YAsis />
            <toolTip />
            <Legend />
            <Line 
                type="monotone"
                dataKey="total"
                stroke="#39A900"
                name="Total"
                strokeWidth={2}
            />
            <Line 
                type="monotone"
                dataKey="total"
                stroke="#39A900"
                name="Completadas"
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
