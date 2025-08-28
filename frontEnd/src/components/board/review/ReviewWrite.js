import { useParams } from "react-router-dom"
import { useState } from "react";
import {BASE_URL} from '../../../api/baseUrl'
import './ReviewWrite.css';

export const ReviewWrtie = () => {
    const { categoryId } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        location: '',
        date: new Date(),
        tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

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

    //이미지 삭제
    const handleImageRemove = (imageId) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    //[POST]작성 완료 버튼 클릭시
    const handleSubmit = (e) => {
        e.preventDefault();

        // const option = {
        //     method: 'POST',                
        //     headers: {
        //         'Content-Type': 'application/json',   
        //         'Authorization': `Bearer ${token}`    
        //     },
        //     body: JSON.stringify(formData)          
        // }

        const apiPost = async() =>{
            try {
                const response = await fetch(`${BASE_URL}/api/review/`)
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        } 
        apiPost();

        console.log('게시글 데이터:', { ...formData, images });
        alert('리뷰글이 작성되었습니다! 🎉');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTagAdd(e);
        }
    };

    return (
        <div className={`BWwrite-container review-bg`}>

            {/* Header */}
            <header className="BWwrite-header">
                <div className="BWheader-content">
                    <div className="BWheader-main">
                        <div className="BWheader-left">
                            {/* 뒤로가기 버튼 */}
                            <button className="BWback-button"
                                onClick={() => {
                                    window.location.href = `/board/${categoryId}`
                                }}>
                                <span className="BWicon-placeholder">←</span>
                            </button>
                            <div className="BWheader-text">
                                <h1 className="BWpage-title">{`축제 이야기 작성`}</h1>
                                <p className="BWpage-subtitle">당신의 축제 경험을 공유해보세요</p>
                            </div>
                        </div>
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
                    <div className="BWform-section">
                        <label className="BWsection-label">카테고리 선택</label>

                    </div>

                    {/* Location & Date */}
                    {formData.category === '리뷰' && <div className="BWform-section">
                        <div className="BWlocation-date-grid">
                            <div className="BWinput-group">
                                <label className="BWinput-label">
                                    <span className="BWicon-placeholder">📍</span>
                                    <span>축제 장소</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="예: 리우데자네이루, 브라질"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    className="BWform-input"
                                />
                            </div>
                            <div className="BWinput-group">
                                <label className="BWinput-label">
                                    <span className="BWicon-placeholder">📅</span>
                                    <span>축제 날짜</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="예: 2024년 2월"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="BWform-input"
                                />
                            </div>
                        </div>
                    </div>}

                    {/* Title Input */}
                    <div className="BWform-section">
                        <input
                            type="text"
                            placeholder="어떤 이야기를 들려주실 건가요? ✨"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="BWtitle-input"
                        />
                    </div>



                    {/* Content Textarea */}
                    <div className="BWform-section">
                        <textarea
                            placeholder="축제에 대한 생생한 이야기를 들려주세요! 🎊&#10;&#10;• 어떤 축제였나요?&#10;• 가장 인상깊었던 순간은?&#10;• 다른 분들에게 추천하고 싶은 포인트는?"
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            rows={8}
                            className="BWcontent-textarea"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="BWform-section">
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
                    </div>

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
