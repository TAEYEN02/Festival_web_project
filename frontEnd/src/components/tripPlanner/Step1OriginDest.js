// tabs: 4
import { useState } from "react";
import PlaceSearchInputKakao from "./PlaceSearchInputKakao";
import FestivalPickerModal from "./FestivalPickerModal";

export default function Step1OriginDest({ onNext }) {
    const [origin, setOrigin] = useState(null);
    const [dest, setDest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const canProceed = origin && dest;

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
            <h2>1. 출발지/도착지 설정</h2>

            <section style={cardStyle}>
                <h3>출발지</h3>
                <PlaceSearchInputKakao
                    placeholder="출발지 검색 또는 내 위치"
                    onSelect={setOrigin}
                />
                {origin && (
                    <div style={infoStyle}>
                        <div>선택: {origin.name}</div>
                        {origin.address && (
                            <div>위치: {origin.address}</div>
                        )}
                        <div>좌표: {origin.lat}, {origin.lng}</div>
                    </div>
                )}
            </section>

            <section style={cardStyle}>
                <h3>도착지(축제)</h3>
                <button type="button" onClick={() => setModalOpen(true)}>
                    축제 검색 모달 열기
                </button>
                {dest && (
                    <div style={infoStyle}>
                        <div>선택: {dest.title || dest.name}</div>
                        {(dest.addr1 || dest.address) && (
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                                {dest.addr1 || dest.address}
                            </div>
                        )}
                        <div>좌표: {dest.mapy || dest.lat}, {dest.mapx || dest.lng}</div>
                    </div>
                )}
            </section>

            <div style={{ textAlign: "right", marginTop: 16 }}>
                <button type="button" onClick={() => onNext?.({ origin, destination: dest })} disabled={!canProceed}>
                    다음
                </button>
            </div>

            <FestivalPickerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onPick={(festival) => {
                    setDest(festival);
                    setModalOpen(false);
                }}
            />
        </div>
    );
}

const cardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: "#fff",
};

const infoStyle = {
    marginTop: 8,
    fontSize: 14,
    color: "#374151",
};
