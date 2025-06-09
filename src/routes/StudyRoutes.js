import { Route } from "react-router-dom";
import { TestPage, LessonStudyPage } from "../pages";

const StudyRoutes = (
    <>
        <Route path='lesson/:lessonId' element={<LessonStudyPage />} />
        <Route path='exam/:examId' element={<TestPage />} />
    </>
);

export default StudyRoutes;
