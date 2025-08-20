import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchFestivals } from "../api/festivals";

export default function FestivalDetailPlaceholder() {
    const { id } = useParams();

    // 실제 상세 담당과 연동되기 전까지 안내용
    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
            <h1 style={{ marginTop: 0 }}>축제 상세 (임시)</h1>
            <p>상세 페이지는 별도 담당자 작업 예정입니다.</p>
            <p>
                현재 선택한 ID: <b>{id}</b>
            </p>
            <p>
                <Link to="/overview">← 한눈에 보기로 돌아가기</Link>
            </p>
        </div>
    );
}
