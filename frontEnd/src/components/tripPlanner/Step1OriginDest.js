import { useState } from "react";
import PlaceSearchInputKakao from "./PlaceSearchInputKakao";
import FestivalPickerModal from "./FestivalPickerModal";
import "./Step1OriginDest.css";

// 공통 구조로 변환 (lat,lng은 숫자 변환)
const normalize = (place) => {
  if (!place) return null;
  const lat = parseFloat(place.lat ?? place.mapy);
  const lng = parseFloat(place.lng ?? place.mapx);
  return {
    name: place.name || place.title || "이름 없음",
    address: place.address || place.addr1 || "",
    lat: isNaN(lat) ? null : lat,
    lng: isNaN(lng) ? null : lng,
  };
};

export default function Step1OriginDest({ onNext }) {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const canProceed = origin && dest;

  // 출발지 ↔ 도착지 스왑
  const handleSwap = () => {
    const prevOrigin = normalize(origin);
    const prevDest = normalize(dest);
    setOrigin(prevDest);
    setDest(prevOrigin);
  };

  return (
    <div className="step1-wrap">
      <h2>1. 출발지/도착지 설정</h2>

      <section className="step1-card">
        <h3>출발지</h3>
        <PlaceSearchInputKakao
          placeholder="출발지 검색 또는 내 위치"
          onSelect={(p) => setOrigin(normalize(p))}
        />
        {origin && (
          <div className="step1-info">
            <div>선택: {origin.name}</div>
            {origin.address && <div className="addr">위치: {origin.address}</div>}
            <div>
              좌표: {origin.lat}, {origin.lng}
            </div>
          </div>
        )}
      </section>

      {/* 스왑 버튼 */}
      <div className="step1-swap">
        <button type="button" className="step1-btn" onClick={handleSwap}>
          ↕
        </button>
      </div>

      <section className="step1-card">
        <h3>도착지(축제)</h3>
        <button
          type="button"
          className="step1-btn"
          onClick={() => setModalOpen(true)}
        >
          축제 검색 모달 열기
        </button>
        {dest && (
          <div className="step1-info">
            <div>선택: {dest.name}</div>
            {dest.address && <div className="addr">위치: {dest.address}</div>}
            <div>
              좌표: {dest.lat}, {dest.lng}
            </div>
          </div>
        )}
      </section>

      <div className="step1-actions">
        <button
          type="button"
          className="step1-btn"
          onClick={() => onNext?.({ origin, destination: dest })}
          disabled={!canProceed}
        >
          다음
        </button>
      </div>

      <FestivalPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPick={(festival) => {
          const core = normalize(festival); // {name,address,lat,lng}
          setDest({
            ...core,
            // 필요한 메타 보존
            meta: {
              rawFestival: festival,                    // 전체 원본
              contentId: String(festival.contentid || festival.id || ""),
              contentTypeId: String(festival.contenttypeid || festival.contentTypeId || ""),
              firstimage: festival.firstimage || festival.firstimage2 || "",
              eventstartdate: festival.eventstartdate || "",
              eventenddate: festival.eventenddate || "",
            },
          });
          setModalOpen(false);
        }}
      />
    </div>
  );
}
