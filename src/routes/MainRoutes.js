import { Route } from "react-router-dom";
import {
    HomePage,
    CoursePage,
    StoragePage,
    StorageItemPage,
    ExamPage,
    NotificationPage,
    CalendarPage,
    SoundSpacePage,
} from "../pages";

const MainRoutes = (
    <>
        <Route index element={<HomePage />} />
        <Route path='course' element={<CoursePage />} />
        <Route path='storage' element={<StoragePage />} />
        <Route path='storage/:storageId' element={<StorageItemPage />} />
        <Route path='exam' element={<ExamPage />} />
        <Route path='sound-space' element={<SoundSpacePage />} />
        <Route path='notification' element={<NotificationPage />} />
        <Route path='calendar' element={<CalendarPage />} />
        <Route path='calendar/:year/:month' element={<CalendarPage />} />
    </>
);

export default MainRoutes;
