import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "./LearningHourChart.css";

const LearningHourChart = ({ data }) => {
    return (
        <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='name'
                        interval={0}
                        angle={-20}
                        textAnchor='end'
                        tick={{ fontSize: 12 }}
                        height={70}
                    />
                    <YAxis unit=' giờ' />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='previous' name='Tháng trước' fill='#82ca9d' />
                    <Bar dataKey='current' name='Tháng này' fill='#2FA2CC' />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LearningHourChart;
