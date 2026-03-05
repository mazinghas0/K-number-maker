import { NextResponse } from "next/server";

export const runtime = "edge"; // Cloudflare 환경 최적화

export async function GET() {
  try {
    // 1회차 날짜: 2002년 12월 7일 21:00 (한국 시간 기준)
    const firstDrawDate = new Date("2002-12-07T21:00:00+09:00");
    const now = new Date();
    
    // 현재까지 흐른 주차(Week) 계산하여 최신 회차 번호 도출
    const diffMs = now.getTime() - firstDrawDate.getTime();
    const latestDrwNo = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;

    // 동행복권 공식 API 호출 (서버에서 호출하므로 CORS 문제 없음)
    const response = await fetch(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${latestDrwNo}`,
      { cache: 'no-store' }
    );

    if (!response.ok) throw new Error("데이터를 가져오지 못했습니다.");

    const data = await response.json();

    // 결과가 정상인지 확인 (returnValue가 fail인 경우 이전 회차 시도)
    if (data.returnValue === "fail") {
       const prevResponse = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${latestDrwNo - 1}`,
        { cache: 'no-store' }
      );
      const prevData = await prevResponse.json();
      return NextResponse.json(prevData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lotto API Error:", error);
    return NextResponse.json({ error: "실시간 데이터를 가져오는데 실패했습니다." }, { status: 500 });
  }
}
