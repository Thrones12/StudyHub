import { Route } from "react-router-dom";
import {
    AccountPage,
    ProgressPage,
    StatisPage,
    LearningPathPage,
    ActivitiesPage,
} from "../pages";

const ProfileRoutes = (
    <>
        <Route index element={<AccountPage />} />
        <Route path='account' element={<AccountPage />} />
        <Route path='progress' element={<ProgressPage />} />
        <Route path='statis' element={<StatisPage />} />
        <Route path='learning-path' element={<LearningPathPage />} />
        <Route path='activities' element={<ActivitiesPage />} />
    </>
);

export default ProfileRoutes;
