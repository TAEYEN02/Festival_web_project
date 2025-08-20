import { useEffect, useMemo, useRef, useState } from "react";

const CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeafletOnce() {
    return new Promise((resolve, reject) => {
        if (window.L) return resolve(window.L);
        // CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = CSS_URL;
        document.head.appendChild(link);
        // JS
        const script = document.createElement("script");
        script.src = JS_URL;
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

export default function MapView({ items = [] }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const [ready, setReady] = useState(!!window.L);

    const points = useMemo(() => {
        return items.filter(f => typeof f.lat === "number" && typeof f.lng === "number");
    }, [items]);

    useEffect(() => {
        let cancelled = false;
        loadLeafletOnce()
            .then(() => {
                if (!cancelled) setReady(true);
            })
            .catch(() => {
                if (!cancelled) setReady(false);
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!ready || !containerRef.current) return;
        const L = window.L;

        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current).setView([36.5, 127.9], 7);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapRef.current);
        }

        // 마커 갱신
        const map = mapRef.current;
        const layerGroup = L.layerGroup().addTo(map);
        points.forEach(f => {
            const marker = L.marker([f.lat, f.lng]).addTo(layerGroup);
            const html = `
                <div style="min-width:180px">
                    <div style="font-weight:700;margin-bottom:4px">${f.name}</div>
                    <div style="font-size:12px;color:#666">${f.address ?? ""}</div>
                    <div style="margin-top:8px">
                        <a href="/festival/${f.id}" style="font-size:12px;text-decoration:underline">상세 보기</a>
                    </div>
                </div>
            `;
            marker.bindPopup(html);
        });

        if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [20, 20] });
        }

        return () => {
            map.removeLayer(layerGroup);
        };
    }, [ready, points]);

    return (
        <div className="map-wrap">
            {!ready && (
                <div className="map-empty">지도를 불러오는 중이거나, 네트워크가 필요해요.</div>
            )}
            {ready && points.length === 0 && (
                <div className="map-empty">표시할 좌표 정보가 있는 축제가 없어요.</div>
            )}
            <div ref={containerRef} className="map-container" />
        </div>
    );
}
