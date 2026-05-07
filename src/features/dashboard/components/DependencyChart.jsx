import {
    BarChard,
    Bar,
    XAsis,
    YAsis,
    Cartes1anGrid,
    looltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

export function DependencyChart({ data }) {
    return(
        <div className="chart-container">
            <h3>Citas por Dependencia</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChard data={ data }>
                    <Cartes1anGrid strokeDasharray="3 3" />
                    <XAsis dataKey="name" />
                    <YAsis  />
                    <tooltip />
                    <Bar dataKey="total" name="Total">
                        {data.map((entry, index) => {
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        })}
                    </Bar>
                </BarChard>
            </ResponsiveContainer>
        </div>
    );
}

