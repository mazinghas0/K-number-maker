import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    // 1. 현재 날짜 기준으로 대략적인 최신 회차 계산
    const firstDrawDate = new Date("2002-12-07T21:00:00+09:00");
    const now = new Date();
    const diffMs = now.getTime() - firstDrawDate.getTime();
    let drwNo = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;

    // 2. 최대 3개 회차를 뒤로 가며 성공할 때까지 시도 (이번주가 아직 안나왔을 수 있으므로)
    for (let i = 0; i < 3; i++) {
      const targetNo = drwNo - i;
      try {
        const response = await fetch(
          `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${targetNo}`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json, text/plain, */*",
              "Referer": "https://www.dhlottery.co.kr/"
            },
            cache: 'no-store'
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        
        // 성공적으로 데이터를 가져왔다면 즉시 반환
        if (data.returnValue === "success") {
          return NextResponse.json(data);
        }
      } catch (e) {
        console.error(`Attempt ${targetNo} failed:`, e);
        continue;
      }
    }

    throw new Error("모든 시도가 실패했습니다.");
  } catch (error) {
    return NextResponse.json({ error: "데이터를 불러올 수 없습니다." }, { status: 500 });
  }
}
