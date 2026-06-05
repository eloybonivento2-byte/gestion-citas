import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

export function DependencyChart({ data }) {
    return(
        <div className="chart-container">
            <h3>Citas por Dependencia</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ data }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis  />
                    <Tooltip />
                    <Bar dataKey="total" name="Total">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

