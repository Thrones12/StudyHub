import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { pdfjs } from "react-pdf";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import { MainLayout, AccountLayout, BasicLayout, AdminLayout } from "./layouts";

// Route files
import MainRoutes from "./routes/MainRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import AccountRoutes from "./routes/AccountRoutes";
import StudyRoutes from "./routes/StudyRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { SoundPage } from "./pages";

// Cấu hình PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path='/auth' element={<BasicLayout />}>
                        {AuthRoutes}
                    </Route>
                    <Route path='/' element={<MainLayout />}>
                        {MainRoutes}
                    </Route>
                    <Route path='/account' element={<AccountLayout />}>
                        {AccountRoutes}
                    </Route>
                    <Route path='/study/' element={<BasicLayout />}>
                        {StudyRoutes}
                    </Route>
                    <Route path='/space' element={<SoundPage />} />
                    <Route path='/admin' element={<AdminLayout />}>
                        {AdminRoutes}
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
