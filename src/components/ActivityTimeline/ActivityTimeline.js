import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCommentDots,
    faThumbsUp,
    faBookmark,
    faBookOpen,
    faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import "./ActivityTimeline.css";

const activityIcons = {
    comment: faCommentDots,
    like: faThumbsUp,
    bookmark: faBookmark,
    lesson: faBookOpen,
    exam: faClipboardCheck,
};
const ActivityTimeline = ({ activities }) => {
    const [sortedActivities, setSortedActivities] = useState([]);

    useEffect(() => {
        if (activities && activities.length > 0) {
            // Sắp xếp hoạt động từ mới đến cũ
            const sorted = [...activities].sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            // Định dạng lại ngày tháng sau khi sắp xếp
            const formattedActivities = sorted.map((activity) => ({
                ...activity,
                date: dayjs(activity.createdAt).format(
                    "[lúc] H:mm, [ngày] D [tháng] M [năm] YYYY"
                ),
            }));

            // Cập nhật state với hoạt động đã được sắp xếp và định dạng ngày tháng
            setSortedActivities(formattedActivities.slice(0, 20));
        }
    }, [activities]);

    return (
        <div className='timeline-container'>
            {sortedActivities.map((activity, index) => (
                <div className='timeline-item' key={index}>
                    <div className='timeline-left'>
                        <div className='icon'>
                            <FontAwesomeIcon
                                icon={activityIcons[activity.type]}
                            />
                        </div>
                        {index !== sortedActivities.length - 1 && (
                            <div className='line'></div>
                        )}
                    </div>
                    <div className='content'>
                        <div className='title'>{activity.title}</div>
                        <div className='date'>{activity.date}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
