// tabs: 4
import { useState } from "react";
import Step1OriginDest from "./Step1OriginDest";
import Step2Preferences from "./Step2Preferences";
import Step3TripOptions from "./Step3TripOptions";
import Step4Review from "./Step4Review";

export default function TripPlannerTestPage() {
    const [step, setStep] = useState(1);
    const [s1, setS1] = useState(null);   // { origin, destination }
    const [s2, setS2] = useState(null);   // { contentTypeIds }
    const [s3, setS3] = useState(null);   // { people, startDate, endDate, ... }

    const toISO = (yyyymmdd) =>
        yyyymmdd && yyyymmdd.length === 8
            ? `${yyyymmdd.slice(0,4)}-${yyyymmdd.slice(4,6)}-${yyyymmdd.slice(6,8)}`
            : "";

    const goStep2 = (data) => { setS1(data); setStep(2); };
    const backTo1 = () => setStep(1);
    const finishStep2 = (data) => { setS2(data); setStep(3); };
    const backTo2 = () => setStep(2);
    const finishStep3 = (data) => { setS3(data); setStep(4); };
    const backTo3 = () => setStep(3);

    const finishWizard = () => {
        const payload = { ...s1, preferences: s2, options: s3 };
        console.log("[Wizard] 최종 payload ::", payload);
        alert("완료. 콘솔 확인.");
    };

    const defaultStart = toISO(s1?.destination?.eventstartdate) || "";
    const defaultEnd = toISO(s1?.destination?.eventenddate) || "";

    return (
        <div style={{ padding: 16 }}>
            <h1>Trip Planner 테스트</h1>
            {step === 1 && <Step1OriginDest onNext={goStep2} />}
            {step === 2 && <Step2Preferences onPrev={backTo1} onNext={finishStep2} />}
            {step === 3 && (
                <Step3TripOptions
                    onPrev={backTo2}
                    onNext={finishStep3}
                    defaultStartDate={defaultStart}
                    defaultEndDate={defaultEnd}
                />
            )}
            {step === 4 && (
                <Step4Review
                    data={{ origin: s1?.origin, destination: s1?.destination, preferences: s2, options: s3 }}
                    onPrev={backTo3}
                    onFinish={finishWizard}
                />
            )}
            <pre style={{ marginTop: 16, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
{JSON.stringify({ step, step1: s1, step2: s2, step3: s3 }, null, 4)}
            </pre>
        </div>
    );
}
