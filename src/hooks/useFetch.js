import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = ({
    url,
    method = "GET",
    data = null,
    deps = [],
    enabled = true,
}) => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!enabled || !url) return; // Không gọi nếu không được bật hoặc không có URL

        setLoading(true);
        try {
            const res = await axios({ method, url, data });
            setResponse(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [url, enabled, ...deps]);

    return { data: response, loading, error, refetch: fetchData };
};

export default useFetch;
