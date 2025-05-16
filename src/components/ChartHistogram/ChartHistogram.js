import { useContext, useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../../context/AuthContext";
import { ExamResult, User } from "../../services";

const ChartHistogram = ({ examResults }) => {
    // Khởi tạo phổ điểm từ 0 đến 10 (mỗi bước 1 điểm)
    const bins = Array.from({ length: 10 }, (_, i) => ({
        range: `${i} - ${i + 1} điểm`,
        count: 0,
    }));

    // Đếm số lượng điểm rơi vào mỗi bin
    examResults.forEach((exam) => {
        const score = exam.score;
        if (typeof score === "number") {
            const index = Math.min(Math.floor(score), 9);
            bins[index].count += 1;
        }
    });

    return (
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={bins}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='range'
                        interval={0}
                        angle={-20}
                        textAnchor='end'
                        tick={{ fontSize: 12 }}
                        height={60}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey='count' name='Số lượng' fill='#82ca9d' />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartHistogram;
