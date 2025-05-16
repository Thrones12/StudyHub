import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const ChartAverageScore = ({ data }) => {
    return (
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='subject'
                        interval={0}
                        angle={-20}
                        textAnchor='end'
                        tick={{ fontSize: 12 }}
                        height={60}
                    />
                    <YAxis domain={[0, 10]} tickCount={11} />
                    <Tooltip
                        formatter={(value) => `${value.toFixed(1)} điểm`}
                    />
                    <Bar
                        dataKey='score'
                        name='Điểm trung bình'
                        fill='#2FA2CC'
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartAverageScore;
