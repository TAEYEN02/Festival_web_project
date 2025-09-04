/* global kakao, daum */
import { useEffect, useRef, useState } from "react";
import "./PlaceSearchInputKakao.css";

export default function PlaceSearchInputKakao({ placeholder = "장소 또는 주소 검색", onSelect }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const psRef = useRef(null);
  const geocoderRef = useRef(null);
  const initedRef = useRef(false);

  // Kakao SDK + Postcode 로드
  useEffect(() => {
    const appkey = process.env.REACT_APP_KAKAO_APP_KEY;
    if (!appkey) { setError("REACT_APP_KAKAO_APP_KEY 누락"); return; }

    const initServices = () => {
      if (!window.kakao?.maps) { setError("Kakao SDK 로드 실패"); return; }
      window.kakao.maps.load(() => {
        if (initedRef.current) return;
        if (!window.kakao.maps.services) { setError("Kakao services 미탑재"); return; }
        psRef.current = new window.kakao.maps.services.Places();
        geocoderRef.current = new window.kakao.maps.services.Geocoder();
        initedRef.current = true;
        setReady(true);
      });
    };

    const exist = document.querySelector('script[data-kakao="maps-sdk"]');
    if (exist) {
      if (window.kakao?.maps?.services) {
        if (!initedRef.current) {
          psRef.current = new window.kakao.maps.services.Places();
          geocoderRef.current = new window.kakao.maps.services.Geocoder();
          initedRef.current = true;
        }
        setReady(true);
      } else {
        initServices();
      }
    } else {
      const s = document.createElement("script");
      s.async = true;
      s.defer = true;
      s.dataset.kakao = "maps-sdk";
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
      s.onload = initServices;
      s.onerror = () => setError("Kakao SDK 스크립트 로드 실패");
      document.head.appendChild(s);
    }

    // postcode
    if (!document.querySelector('script[src*="postcode.v2.js"]')) {
      const ps = document.createElement("script");
      ps.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      ps.async = true; ps.defer = true;
      document.head.appendChild(ps);
    }
  }, []);

  // 키워드 검색(Enter 전용)
  const search = (keyword) => {
    const k = (keyword || "").trim();
    if (!ready) { setError("초기화 중. 잠시 후 다시 시도"); return; }
    if (k.length < 2) { setError("검색어는 2자 이상"); return; }
    if (!psRef.current) { setError("검색 엔진 미초기화"); return; }

    setLoading(true);
    setError("");
    psRef.current.keywordSearch(k, (data, status) => {
      setLoading(false);
      if (status !== window.kakao.maps.services.Status.OK) {
        setItems([]); setError("검색 결과가 없습니다."); return;
      }
      setItems(data.map((d) => ({
        id: d.id,
        name: d.place_name || d.road_address_name || d.address_name,
        address: d.road_address_name || d.address_name || "",
        lat: parseFloat(d.y), lng: parseFloat(d.x),
      })));
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); search(q); }
  };

  // 내 위치
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setError("이 브라우저는 위치 정보를 지원하지 않습니다."); return; }
    setLoading(true); setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        const finish = (addr) => { setLoading(false); onSelect?.({ name:"내 위치", address:addr||"", lat, lng }); };
        if (!geocoderRef.current || !window.kakao?.maps) { finish(""); return; }
        const g = geocoderRef.current;
        const coord = new window.kakao.maps.LatLng(lat, lng);
        g.coord2Address(coord.getLng(), coord.getLat(), (res, status) => {
          if (status === window.kakao.maps.services.Status.OK && res?.[0]) {
            const r = res[0];
            const addr = r.road_address?.address_name || r.address?.address_name || "";
            if (addr) { finish(addr); return; }
          }
          g.coord2RegionCode(coord.getLng(), coord.getLat(), (res2, status2) => {
            if (status2 === window.kakao.maps.services.Status.OK && res2?.[0]) {
              const admin = res2.find((x)=>x.region_type==="H") || res2[0];
              const addr2 = [admin.region_1depth_name, admin.region_2depth_name, admin.region_3depth_name].filter(Boolean).join(" ");
              finish(addr2);
            } else { setLoading(false); setError("역지오코딩 실패"); finish(""); }
          });
        });
      },
      (err) => { setLoading(false); setError(`위치 권한 거부 또는 실패 (${err.code})`); },
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  // 우편번호 팝업 → 좌표 변환 → onSelect (검색 버튼 클릭 시)
  const openPostcode = () => {
    if (!window.daum?.Postcode) { alert("우편번호 API 로딩 실패"); return; }
    if (!geocoderRef.current) { alert("지오코더 미준비"); return; }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.roadAddress || data.jibunAddress || data.address;
        if (!addr) return;
        geocoderRef.current.addressSearch(addr, (res, status) => {
          if (status !== kakao.maps.services.Status.OK || !res?.length) { alert("좌표 변환 실패"); return; }
          const { x, y, address_name } = res[0];
          const place = {
            name: data.buildingName || data.bname || data.sigungu || address_name || addr,
            address: address_name || addr,
            lat: parseFloat(y), lng: parseFloat(x),
          };
          onSelect?.(place);
          setItems([]); setQ("");
        });
      },
    }).open();
  };

  return (
    <div className="psk-wrap">
      <div className="psk-row">
        <input
          type="text"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          className="psk-input"
          aria-label="장소 검색"
        />
        {/* 클릭 = 우편번호 팝업 */}
        <button type="button" onClick={openPostcode} disabled={loading || !ready} className="psk-btn" aria-label="주소 검색">
          검색
        </button>
        <button type="button" onClick={handleUseMyLocation} disabled={loading || !ready} className="psk-btn" aria-label="내 위치 사용">
          내 위치
        </button>
      </div>

      {error && <div className="psk-err">{error}</div>}
      {loading && <div className="psk-hint">불러오는 중…</div>}

      <ul className="psk-list" role="listbox" aria-label="검색 결과 목록">
        {items.map((it) => (
          <li key={it.id} className="psk-item" role="option">
            <div className="name">{it.name}</div>
            <div className="addr">{it.address}</div>
            <div className="act">
              <button type="button" className="psk-btn" onClick={() => onSelect?.(it)} aria-label="이 장소 선택">선택</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
