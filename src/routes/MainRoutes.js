import { Route } from "react-router-dom";
import {
    HomePage,
    CoursePage,
    ExamPage,
    TaskPage,
    CSKHPage,
    CalendarPage,
} from "../pages";

const MainRoutes = (
    <>
        <Route index element={<HomePage />} />
        <Route path='course' element={<CoursePage />} />
        <Route path='cskh' element={<CSKHPage />} />
        <Route path='exam' element={<ExamPage />} />
        <Route path='task' element={<CalendarPage />} />
        <Route path='task/:year/:month' element={<CalendarPage />} />
    </>
);

export default MainRoutes;
