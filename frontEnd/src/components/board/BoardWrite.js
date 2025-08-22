import { useParams } from "react-router-dom"
import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import './BoardWrite.css';


export const BoardWrite = () => {
    const { categoryId } = useParams();

    const [formData, setFormData] = useState({
        category: '잡담',
        title: '',
        content: '',
        date: new Date(),
        author: 'usernickname',
        likes: 0,
        comments: 0,
        tags: [],
        user: 1
    });
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const categories = [
        { id: 1, value: '잡담', label: '잡담', emoji: '💬', color: 'chat' },
        { id: 2, value: '질문', label: '질문', emoji: '❓', color: 'inquiry' },
        // { id: 3, value: '후기', label: '후기', emoji: '⭐', color: 'review' }
    ];

    //내용 넣기
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    //태그 추가
    const handleTagAdd = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    //태그 삭제
    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    url: event.target.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setImages(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        url: event.target.result,
                        name: file.name
                    }]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleImageRemove = (imageId) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    //[POST]작성완료 버튼 동작.
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('게시글 데이터:',formData);
        alert('게시글이 작성되었습니다! 🎉');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTagAdd(e);
        }
    };

    return (
        <div className={`BWwrite-container`}>

            {/* Header */}
            <header className="BWwrite-header">
                <div className="BWheader-content">
                    <div className="BWheader-main">
                        {/* 작성하기 상단바 왼쪽 */}
                        <div className="BWheader-left">
                            {/* 뒤로가기 버튼 */}
                            <button className="BWback-button"
                                onClick={() => {
                                    window.location.href = `/board/${categoryId}`
                                }}>
                                <span className="BWicon-placeholder">←</span>
                            </button>
                            {/* 간단한 안내 */}
                            <div className="BWheader-text">
                                <h1 className="BWpage-title">{`${categories[categoryId - 1]?.value||''} 게시판 이야기 작성`}</h1>
                                <p className="BWpage-subtitle">당신의 경험을 공유해보세요</p>
                            </div>
                        </div>
                        {/* 상단바 오른쪽 발행하기 버튼 */}
                        <button onClick={handleSubmit} className="BWpublish-button">
                            <span className="BWicon-placeholder">📤</span>
                            <span>발행하기</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="BWwrite-main">
                <div className="BWform-container">

                    {/* Category Selection */}
                    <div className="BWform-top">
                        <div className="BWform-section">
                            <label className="BWsection-label">카테고리 선택</label>
                            <div className="BWcategory-buttons">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => handleInputChange('category', cat.value)}
                                        className={`BWcategory-btn ${formData.category === cat.value ? 'BWcategory-btn-active' : ''} BWcategory-${cat.color}`}
                                    >
                                        <span>{cat.emoji}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* 게시판 제목 */}
                    <div className="BWform-section">
                        <input
                            type="text"
                            placeholder="어떤 이야기를 들려주실 건가요? ✨"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="BWtitle-input"
                        />
                    </div>

                    {/* 게시판 내용 */}
                    <div className="BWform-section">
                        <div className="BWquill-wrapper">
                            <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(content) => handleInputChange('content', content)}
                            modules={{
                                toolbar: [
                                    ["image"], // 링크, 이미지, 동영상
                                    [{ header: 1 }, { header: 2 }, { header: 3 }], // H1, H2, H3, 일반
                                    ["bold", "italic", "underline", "strike"], // 굵게, 기울임, 밑줄, 취소선
                                    [{ color: [] }], // 글자색, 배경색
                                    [{ align: [] }], // 왼쪽, 가운데, 오른쪽, 양쪽 정렬
                                ]
                            }}
                            placeholder="축제에 대한 생생한 이야기를 들려주세요! 🎊&#10;&#10;• 어떤 축제였나요?&#10;• 가장 인상깊었던 순간은?&#10;• 다른 분들에게 추천하고 싶은 포인트는?"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    {/* <div className="BWform-section">
                        <label className="BWsection-label">
                            <span className="BWicon-placeholder">📷</span>
                            <span>사진 업로드</span>
                        </label>

                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            className={`BWimage-drop-zone ${isDragging ? 'BWimage-drop-zone-active' : ''}`}
                            onClick={() => document.getElementById('imageInput').click()}
                        >
                            <span className="BWupload-icon">🖼️</span>
                            <p className="BWupload-text">클릭하거나 이미지를 드래그해서 업로드하세요</p>
                            <p className="BWupload-subtext">PNG, JPG, GIF 파일을 지원합니다</p>
                        </div>

                        <input
                            id="imageInput"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="BWfile-input"
                        />

                        {images.length > 0 && (
                            <div className="BWimage-preview-grid">
                                {images.map((image) => (
                                    <div key={image.id} className="BWimage-preview-item">
                                        <img src={image.url} alt={image.name} className="BWpreview-image" />
                                        <button
                                            type="button"
                                            onClick={() => handleImageRemove(image.id)}
                                            className="BWremove-image-btn"
                                        >
                                            <span className="BWicon-placeholder">✕</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div> */}

                    {/* Tags */}
                    <div className="BWform-section">
                        <label className="BWsection-label">
                            <span className="BWicon-placeholder">#</span>
                            <span>태그 추가</span>
                        </label>

                        <div className="BWtag-input-section">
                            <input
                                type="text"
                                placeholder="태그 입력 (예: 카니발, 브라질)"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="BWtag-input"
                            />
                            <button
                                type="button"
                                onClick={handleTagAdd}
                                className="BWtag-add-btn"
                            >
                                추가
                            </button>
                        </div>

                        {formData.tags.length > 0 && (
                            <div className="BWtags-display">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="BWtag-item">
                                        <span>#{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tag)}
                                            className="BWtag-remove-btn"
                                        >
                                            <span className="BWicon-placeholder">✕</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Section */}
                <div className="BWsubmit-section">
                    <div className="BWsubmit-header">
                        <div className="BWauthor-preview">
                            <div className="BWauthor-avatar">🎭</div>
                            <div className="BWauthor-info">
                                <p className="BWauthor-name">festival_writer</p>
                                <p className="BWauthor-status">새로운 축제 이야기를 작성 중...</p>
                            </div>
                        </div>
                        <div className={`BWwriting-status ${formData.title && formData.content ? 'BWwriting-complete' : ''}`}>
                            {formData.title && formData.content ? '작성 완료!' : '작성 중...'}
                        </div>
                    </div>

                    <div className="BWsubmit-footer">
                        <div className="BWsubmit-tip">
                            💡 팁: 생생한 사진과 함께 경험을 공유해보세요!
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title || !formData.content}
                            className={`BWfinal-submit-btn ${formData.title && formData.content ? 'BWfinal-submit-btn-active' : ''}`}
                        >
                            <span className="BWicon-placeholder">📤</span>
                            <span>축제 이야기 발행하기 🎪</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
