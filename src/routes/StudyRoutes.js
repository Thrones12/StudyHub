import { Route } from "react-router-dom";
import StudyPage from "../pages/StudyPage/StudyPage";
import StudyExamPage from "../pages/StudyExamPage/StudyExamPage";

const StudyRoutes = (
    <>
        <Route path=':lessonId' element={<StudyPage />} />
        <Route path='exam/:chapterId' element={<StudyExamPage />} />
    </>
);

export default StudyRoutes;
