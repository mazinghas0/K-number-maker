import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// 서버 사이드용 Supabase 클라이언트 (API 키 직접 사용)
const supabaseUrl = "https://synnvxrkbuvueybxbynz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bm52eHJrYnV2dWV5YnhieW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDUzMzQsImV4cCI6MjA4ODI4MTMzNH0.8uxGLjdFeZzlvQKhkKT-xSoE72F8wOA1K_lFoVfKtp4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // 1. 현재 날짜 기준 최신 회차 계산
    const firstDrawDate = new Date("2002-12-07T21:00:00+09:00");
    const now = new Date();
    const diffMs = now.getTime() - firstDrawDate.getTime();
    let latestDrwNo = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;

    // 2. 먼저 우리 Supabase 장부(winning_numbers)에 데이터가 있는지 확인
    const { data: cachedData, error: cacheError } = await supabase
      .from("winning_numbers")
      .select("data")
      .eq("drw_no", latestDrwNo)
      .single();

    if (!cacheError && cachedData) {
      console.log("캐시된 데이터 반환 (0.1초!)");
      return NextResponse.json(cachedData.data);
    }

    // 3. 장부에 없으면 느린 우회로(프록시) 시도
    console.log("장부에 데이터 없음. 공식 사이트 조회 시도...");
    const lottoUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${latestDrwNo}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(lottoUrl)}`;

    const response = await fetch(proxyUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error("프록시 서버 응답 실패");

    const data = await response.json();

    // 4. 성공적으로 가져왔다면 우리 장부에 적어두기 (다음 사람을 위해!)
    if (data.returnValue === "success") {
      await supabase
        .from("winning_numbers")
        .insert([{ drw_no: latestDrwNo, data: data }]);
      
      return NextResponse.json(data);
    }

    // 5. 이번 주가 아직 안 나왔으면 지난 주 데이터라도 장부에서 가져오기
    const { data: prevData } = await supabase
      .from("winning_numbers")
      .select("data")
      .eq("drw_no", latestDrwNo - 1)
      .single();

    if (prevData) return NextResponse.json(prevData.data);

    throw new Error("모든 시도가 실패했습니다.");
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      drwNo: 1210,
      drwtNo1: 3, drwtNo2: 7, drwtNo3: 14, drwtNo4: 25, drwtNo5: 31, drwtNo6: 42,
      bnusNo: 8, drwNoDate: "2026-02-28", returnValue: "fallback"
    });
  }
}
