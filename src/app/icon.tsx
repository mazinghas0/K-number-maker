import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111 0%, #1e1e30 100%)",
          borderRadius: "110px",
          boxShadow: "inset 0 0 50px rgba(255, 215, 0, 0.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(234, 179, 8, 0.6) 0%, rgba(234, 179, 8, 0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            fontSize: "250px",
            fontWeight: "900",
            color: "#FFD700",
            textShadow: "0 10px 20px rgba(0,0,0,0.5)",
            fontFamily: "system-ui, sans-serif",
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-10px",
          }}
        >
          K
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "100px",
            fontSize: "80px",
            display: "flex",
            textShadow: "0 5px 10px rgba(0,0,0,0.5)",
          }}
        >
          🍀
        </div>
      </div>
    ),
    { ...size }
  );
}
