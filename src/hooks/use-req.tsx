import { useState } from "react";
const baseURL =
 "http://localhost:3900/api/v1";

export default function useRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  headers?: Record<string, any>
) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>();
  const [statusCode, setStatusCode] = useState(0);
  const token = localStorage.getItem("authToken");

  async function makeRequest(
    data?: any,
    params?: Record<string, any>,
    pathParam?: string
  ) {
    setLoading(true);

    const queryParams = new URLSearchParams(params || {}).toString();
    const urlWithParams =
      pathParam && queryParams
        ? `${baseURL}${endpoint}/${pathParam}?${queryParams}`
        : pathParam
          ? `${baseURL}${endpoint}/${pathParam}`
          : queryParams
            ? `${baseURL}${endpoint}?${queryParams}`
            : `${baseURL}${endpoint}`;

    try {
      const isFormData = data instanceof FormData;

      const res = await fetch(urlWithParams, {
        method,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${token}`,
          ...headers,
        },
        body:
          ["POST", "PUT", "DELETE", "PATCH"].includes(method) && data
            ? isFormData
              ? data
              : JSON.stringify(data)
            : undefined,
      });

      const json = await res.json();

      setResponse(json);
      setStatusCode(res.status);


      if (!res.ok) {
        // toast.error(json.message || "An error occurred, please try again");
      } else if (method !== "GET") {
        // toast.success(json.message || "Request successful");
      }

      setLoading(false);
      return [json, res.status];
    } catch (error: any) {
      setLoading(false);
      return [{}, 500];
    }
  }

  return { loading, makeRequest, response, statusCode };
}
