export default function EmptyState({ message = "조건에 맞는 축제가 없어요." }) {
    return (
        <div className="empty-state">
            <div className="empty-emoji" aria-hidden>🗺️</div>
            <div className="empty-text">{message}</div>
        </div>
    );
}
