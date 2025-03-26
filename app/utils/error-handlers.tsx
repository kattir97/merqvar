import { ErrorResponse } from "react-router";

// app/utils/error-handlers.ts
export const rateLimitHandler = ({ error }: { error: ErrorResponse }) => (
  <div>
    <h1>Rate Limit Exceeded</h1>
    <p>{error.data.error}</p>
    <p>Please wait a few minutes before trying again.</p>
  </div>
);
