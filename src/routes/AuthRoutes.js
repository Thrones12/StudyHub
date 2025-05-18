import { Route } from "react-router-dom";
import { RegisterPage, ForgotPage, VerifyPage, LoginPage } from "../pages";

const AuthRoutes = (
    <>
        <Route index element={<LoginPage />} />
        <Route path='register' element={<RegisterPage />} />
        <Route path='login' element={<LoginPage />} />
        <Route path='forgot' element={<ForgotPage />} />
        <Route path='verify' element={<VerifyPage />} />
    </>
);

export default AuthRoutes;
