import { Route } from "react-router-dom";
import {
    ProfilePage,
    ProgressPage,
    StatisPage,
    LearningPathPage,
    LikeLessonPage,
    SaveExamPage,
} from "../pages";

const ProfileRoutes = (
    <>
        <Route index element={<ProfilePage />} />
        <Route path='profile' element={<ProfilePage />} />
        <Route path='progress' element={<ProgressPage />} />
        <Route path='statis' element={<StatisPage />} />
        <Route path='learning-path' element={<LearningPathPage />} />
        <Route path='saves' element={<SaveExamPage />} />
        <Route path='likes' element={<LikeLessonPage />} />
    </>
);

export default ProfileRoutes;
