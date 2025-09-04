// tabs: 4
import { useEffect, useRef, useState } from "react";

export default function PlaceSearchInputKakao({ placeholder = "장소 또는 주소 검색", onSelect }) {
    const [q, setQ] = useState("");
    const [items, setItems] = useState([]);

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const psRef = useRef(null);
    const geocoderRef = useRef(null);
    const initedRef = { current: false };

    // Kakao SDK 로드
    useEffect(() => {
        const appkey = process.env.REACT_APP_KAKAO_APP_KEY;
        if (!appkey) return setError("REACT_APP_KAKAO_APP_KEY 누락");

        const initServices = () => {
            if (!window.kakao?.maps) { setError("Kakao SDK 로드 실패"); return; }
            window.kakao.maps.load(() => {
                if (initedRef.current) return;
                if (!window.kakao.maps.services) { setError("Kakao services 미탑재"); return; }
                psRef.current = new window.kakao.maps.services.Places();
                geocoderRef.current = new window.kakao.maps.services.Geocoder();
                initedRef.current = true;
                setReady(true);                             // ← 준비 완료
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
            return;
        }

        const s = document.createElement("script");
        s.async = true;
        s.defer = true;
        s.dataset.kakao = "maps-sdk";
        s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
        s.onload = initServices;
        s.onerror = () => setError("Kakao SDK 스크립트 로드 실패");
        document.head.appendChild(s);
    }, []);

    const init = () => {
        if (!window.kakao?.maps?.services) return;
        psRef.current = new window.kakao.maps.services.Places();
        geocoderRef.current = new window.kakao.maps.services.Geocoder();
    };

    const search = (keyword) => {
        const k = (keyword || "").trim();
        if (!ready) { setError("초기화 중. 잠시 후 다시 시도"); return; }   // ← 가드
        if (k.length < 2) { setError("검색어는 2자 이상"); return; }        // ← UX 가드
        if (!psRef.current) { setError("검색 엔진 미초기화"); return; }

        setLoading(true);
        setError("");
        psRef.current.keywordSearch(k, (data, status) => {
            setLoading(false);
            if (status !== window.kakao.maps.services.Status.OK) {
                setItems([]);
                setError("검색 결과가 없습니다.");
                return;
            }
            setItems(data.map((d) => ({
                id: d.id,
                name: d.place_name || d.road_address_name || d.address_name,
                address: d.road_address_name || d.address_name || "",
                lat: parseFloat(d.y),
                lng: parseFloat(d.x),
            })));
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            search(q);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError("이 브라우저는 위치 정보를 지원하지 않습니다.");
            return;
        }
        setLoading(true);
        setError("");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                const finish = (addr) => {
                    console.log("addr :::", addr);
                    setLoading(false);
                    onSelect?.({ name: "내 위치", address: addr || "", lat, lng });
                };

                // geocoder 없으면 좌표만 반환
                if (!geocoderRef.current || !window.kakao?.maps) {
                    finish("");
                    return;
                }

                const g = geocoderRef.current;
                const coord = new window.kakao.maps.LatLng(lat, lng);

                // 1) 도로명/지번 주소 시도
                g.coord2Address(coord.getLng(), coord.getLat(), (res, status) => {
                    if (status === window.kakao.maps.services.Status.OK && res?.[0]) {
                        const r = res[0];
                        const addr =
                            r.road_address?.address_name ||
                            r.address?.address_name ||
                            "";
                        if (addr) {
                            finish(addr);
                            return;
                        }
                    }
                    // 2) 실패 시 행정동 주소(법정동) 폴백
                    g.coord2RegionCode(coord.getLng(), coord.getLat(), (res2, status2) => {
                        if (status2 === window.kakao.maps.services.Status.OK && res2?.[0]) {
                            const admin = res2.find((x) => x.region_type === "H") || res2[0];
                            const addr2 = [admin.region_1depth_name, admin.region_2depth_name, admin.region_3depth_name]
                                .filter(Boolean)
                                .join(" ");
                            finish(addr2);
                        } else {
                            setLoading(false);
                            setError("역지오코딩 실패");
                            finish("");
                        }
                    });
                });
            },
            (err) => {
                setLoading(false);
                setError(`위치 권한 거부 또는 실패 (${err.code})`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={inputStyle}
                />
                <button type="button" onClick={() => search(q)} disabled={loading || !ready}>
                    검색
                </button>
                <button type="button" onClick={handleUseMyLocation} disabled={loading || !ready}>
                    내 위치
                </button>
            </div>
            {error && <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div>}
            {loading && <div style={{ fontSize: 13 }}>불러오는 중…</div>}
            <ul style={listStyle}>
                {items.map((it) => (
                    <li key={it.id} style={itemStyle}>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{it.address}</div>
                        <div style={{ marginTop: 6, textAlign: "right" }}>
                            <button
                                type="button"
                                onClick={() => onSelect?.(it)}
                            >
                                선택
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const inputStyle = {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
};

const listStyle = {
    listStyle: "none",
    margin: 0,
    padding: 0,
    maxHeight: 280,
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
};

const itemStyle = {
    padding: 12,
    borderBottom: "1px solid #f1f5f9",
};
