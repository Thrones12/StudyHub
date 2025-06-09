import { Route } from "react-router-dom";
import {
    AdminUserPage,
    AdminLessonPage,
    AdminExamPage,
    AdminQuestionPage,
    AdminSupportPage,
    AdminThemePage,
    AdminSoundPage,
    AdminUserDetailPage,
} from "../pages";

const AdminRoutes = (
    <>
        <Route index element={<AdminUserPage />} />
        <Route path='user' element={<AdminUserPage />} />
        <Route path='user/:userId' element={<AdminUserDetailPage />} />
        <Route path='lesson' element={<AdminLessonPage />} />
        <Route path='exam' element={<AdminExamPage />} />
        <Route path='question' element={<AdminQuestionPage />} />
        <Route path='theme' element={<AdminThemePage />} />
        <Route path='sound' element={<AdminSoundPage />} />
        <Route path='support' element={<AdminSupportPage />} />
    </>
);

export default AdminRoutes;
