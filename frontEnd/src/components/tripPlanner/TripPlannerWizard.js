// tabs: 4
import { useState } from "react";
import Step1OriginDest from "./Step1OriginDest";
import Step2Preferences from "./Step2Preferences";
import Step3TripOptions from "./Step3TripOptions";
import Step4Review from "./Step4Review";

export default function TripPlannerWizard() {
    const [step, setStep] = useState(1);
    const [s1, setS1] = useState(null);   // { origin, destination }
    const [s2, setS2] = useState(null);   // { contentTypeIds }
    const [s3, setS3] = useState(null);   // { people, startDate, endDate, ... }

    const toISO = (yyyymmdd) =>
        yyyymmdd && yyyymmdd.length === 8
            ? `${yyyymmdd.slice(0,4)}-${yyyymmdd.slice(4,6)}-${yyyymmdd.slice(6,8)}`
            : "";

    const defaultStart = toISO(s1?.destination?.eventstartdate) || "";
    const defaultEnd = toISO(s1?.destination?.eventenddate) || "";

    const finishWizard = () => {
        const payload = { ...s1, preferences: s2, options: s3 };
        console.log("[TripPlanner] 최종 payload ::", payload);
        alert("완료. 콘솔 확인.");
    };

    return (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
            <WizardHeader step={step} />
            {step === 1 && <Step1OriginDest onNext={(d) => { setS1(d); setStep(2); }} />}
            {step === 2 && <Step2Preferences onPrev={() => setStep(1)} onNext={(d) => { setS2(d); setStep(3); }} />}
            {step === 3 && (
                <Step3TripOptions
                    onPrev={() => setStep(2)}
                    onNext={(d) => { setS3(d); setStep(4); }}
                    defaultStartDate={defaultStart}
                    defaultEndDate={defaultEnd}
                />
            )}
            {step === 4 && (
                <Step4Review
                    data={{ origin: s1?.origin, destination: s1?.destination, preferences: s2, options: s3 }}
                    onPrev={() => setStep(3)}
                    onFinish={finishWizard}
                />
            )}
        </div>
    );
}

function WizardHeader({ step }) {
    const steps = ["출발/도착", "선호 스타일", "인원·기간", "요약"];
    return (
        <div style={{ marginBottom: 12 }}>
            <h1 style={{ margin: "6px 0" }}>여행 일정 플래너</h1>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 6 }}>
                {steps.map((label, idx) => {
                    const n = idx + 1;
                    const active = n === step;
                    const done = n < step;
                    return (
                        <div key={label} style={{
                            padding: "10px 8px",
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            background: active ? "#eef2ff" : done ? "#f1f5f9" : "#fff",
                            textAlign: "center",
                            fontWeight: active ? 700 : 500
                        }}>
                            {n}. {label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
