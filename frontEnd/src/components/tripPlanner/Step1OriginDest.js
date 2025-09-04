import { useState } from "react";
import PlaceSearchInputKakao from "./PlaceSearchInputKakao";
import FestivalPickerModal from "./FestivalPickerModal";
import "./Step1OriginDest.css";

export default function Step1OriginDest({ onNext }) {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const canProceed = origin && dest;

  return (
    <div className="step1-wrap">
      <h2>1. 출발지/도착지 설정</h2>

      <section className="step1-card">
        <h3>출발지</h3>
        <PlaceSearchInputKakao
          placeholder="출발지 검색 또는 내 위치"
          onSelect={setOrigin}
        />
        {origin && (
          <div className="step1-info">
            <div>선택: {origin.name}</div>
            {origin.address && <div className="addr">위치: {origin.address}</div>}
            <div>좌표: {origin.lat}, {origin.lng}</div>
          </div>
        )}
      </section>

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
            <div>선택: {dest.title || dest.name}</div>
            {(dest.addr1 || dest.address) && (
              <div className="addr">{dest.addr1 || dest.address}</div>
            )}
            <div>좌표: {dest.mapy || dest.lat}, {dest.mapx || dest.lng}</div>
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
          setDest(festival);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
