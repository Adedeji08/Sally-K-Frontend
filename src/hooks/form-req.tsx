import { useState } from "react";
const baseURL =
    "http://localhost:3900/api/v1";


export default function useApi(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    initialHeaders: Record<string, string> = {}
) {
    const [loading, setLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<any>(null);
    const [customHeaders, setCustomHeaders] = useState<Record<string, string>>(initialHeaders);
    const [statusCode, setStatusCode] = useState<number>(0);

    const updateHeaders = (newHeaders: Record<string, string>) => {
        setCustomHeaders((prev) => ({ ...prev, ...newHeaders }));
    };

    async function makeRequest(
        data: any = null,
        params: Record<string, string> = {}
    ): Promise<[any, number]> {
        setLoading(true);

        const queryParams: string = new URLSearchParams(params).toString();
        const urlWithParams: string = queryParams
            ? `${baseURL}${endpoint}?${queryParams}`
            : `${baseURL}${endpoint}`;

        let body: any;
        let contentType: string = "application/json";

        if (data instanceof FormData) {
            body = data;
            contentType = "multipart/form-data";
        } else if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
            body = JSON.stringify(data);
        }

        const res = await fetch(urlWithParams, {
            method,
            headers: {
                ...customHeaders,
                ...(contentType !== "multipart/form-data" && {
                    "Content-Type": contentType,
                }),
            },
            body,
        });

        const json = await res.json();

        setResponse(json);
        setStatusCode(res.status);
        setLoading(false);

        return [json, res.status];
    }

    return { loading, makeRequest, response, statusCode, updateHeaders };
}