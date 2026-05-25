// Use the deployed backend URL by default
export const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://genos-be.vercel.app";
