// Global variables to track current section and language
let currentLanguage = '';
let currentSection = 0;
let sectionsData = [];

// Load content from JSON file
async function loadContent() {
    try {
        // Use absolute path from the root of the website
        const response = await fetch('/vote/data/content.json', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-cache'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        sectionsData = data?.sections || [];
        
        // Initialize the first section after loading content
        if (sectionsData.length > 0) {
            showSection(0);
        }
    } catch (error) {
        console.error('Error loading content:', error);
        // Fallback to default content if loading fails
        sectionsData = [
            {
                id: 'error',
                titles: {
                    'ja': 'エラー',
                    'en': 'Error',
                    'tl': 'Error',
                    'ko': '오류'
                },
                content: {
                    'ja': '<p>コンテンツの読み込み中にエラーが発生しました。</p>',
                    'en': '<p>An error occurred while loading content.</p>',
                    'tl': '<p>May naganap na error habang naglo-load ng content.</p>',
                    'ko': '<p>콘텐츠를 로드하는 중 오류가 발생했습니다.</p>'
                }
            }
        ];
    }
}

// Function to handle language selection
function selectLanguage(lang) {
    currentLanguage = lang;
    currentSection = 0; // Reset to first section
    
    // Hide language selection screen and show navigation
    const languageScreen = document.getElementById('language-screen');
    const navButtons = document.querySelector('.nav-buttons');
    
    if (languageScreen) languageScreen.classList.remove('active');
    if (navButtons) navButtons.style.display = 'flex';
    
    // Show selected language content
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
        // Show the first section
        showSection(0);
    }
    
    // Update navigation
    updateNavigation();
}

// Function to show a specific section
function showSection(sectionIndex) {
    if (!sectionsData.length || !currentLanguage) return;
    
    const section = sectionsData[sectionIndex];
    if (!section) return;
    
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) return;
    
    // Create or update section content
    let sectionElement = document.getElementById(`${section.id}-section`);
    
    if (!sectionElement) {
        sectionElement = document.createElement('div');
        sectionElement.id = `${section.id}-section`;
        sectionElement.className = 'content-section card';
        contentContainer.appendChild(sectionElement);
    }
    
    // Update section content
    sectionElement.innerHTML = `
        <div class="card-header">
            <h1>${section.titles[currentLanguage] || section.titles['en']}</h1>
        </div>
        <div class="card-body">
            ${section.content[currentLanguage] || section.content['en']}
        </div>
    `;
    
    // Hide all sections first
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section with animation
    setTimeout(() => {
        sectionElement.classList.add('active');
    }, 10);
    
    // Update current section index
    currentSection = sectionIndex;
    
    // Update navigation
    updateNavigation();
}

// Function to load section content
function loadSectionContent(sectionId, container) {
    // Content for each section in all three languages
    const content = {
        'intro': {
            'ja': `
                <div class="section-content">
                    <p>私が目指す学校は、すべての人が、楽しく学ぶことができる学校です。</p>
                    <p>そのために、新しい学校生活の形を提案します。</p>
                </div>
            `,
            'en': `
                <div class="section-content">
                    <p>The school I aim to create is one where everyone can learn with joy.</p>
                    <p>To achieve this, I propose a new form of school life.</p>
                </div>
            `,
            'tl': `
                <div class="section-content">
                    <p>Ang paaralang nais kong makamit ay isang lugar kung saan lahat ay maaaring matuto nang may kasiyahan.</p>
                    <p>Upang makamit ito, nagmumungkahi ako ng isang bagong anyo ng buhay sa paaralan.</p>
                </div>
            `
        },
        'about': {
            'ja': `
                <div class="section-content">
                    <h2>Deep-School とは</h2>
                    <p>Deep-School は、学校生活をより良くするための革新的なプラットフォームです。</p>
                    <div class="feature-grid">
                        <div class="feature">
                            <i class="fas fa-mobile-alt"></i>
                            <h3>モバイルアプリ</h3>
                            <p>スマートフォンやタブレットで簡単にアクセス</p>
                        </div>
                        <div class="feature">
                            <i class="fas fa-shield-alt"></i>
                            <h3>セキュア</h3>
                            <p>強力な暗号化でデータを保護</p>
                        </div>
                    </div>
                </div>
            `,
            'en': `
                <div class="section-content">
                    <h2>About Deep-School</h2>
                    <p>Deep-School is an innovative platform to enhance school life.</p>
                    <div class="feature-grid">
                        <div class="feature">
                            <i class="fas fa-mobile-alt"></i>
                            <h3>Mobile App</h3>
                            <p>Easy access on smartphones and tablets</p>
                        </div>
                        <div class="feature">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Secure</h3>
                            <p>Data protection with strong encryption</p>
                        </div>
                    </div>
                </div>
            `,
            'tl': `
                <div class="section-content">
                    <h2>Tungkol sa Deep-School</h2>
                    <p>Ang Deep-School ay isang makabagong platform upang mapahusay ang buhay sa paaralan.</p>
                    <div class="feature-grid">
                        <div class="feature">
                            <i class="fas fa-mobile-alt"></i>
                            <h3>Mobile App</h3>
                            <p>Madaling ma-access sa mga smartphone at tablet</p>
                        </div>
                        <div class="feature">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Ligtas</h3>
                            <p>Proteksyon ng data na may malakas na encryption</p>
                        </div>
                    </div>
                </div>
            `
        },
        // Add more sections with similar structure
        'design': {
            'ja': '<div class="section-content"><h2>デザイン</h2><p>直感的で使いやすいインターフェースを採用しています。</p></div>',
            'en': '<div class="section-content"><h2>Design</h2><p>Featuring an intuitive and user-friendly interface.</p></div>',
            'tl': '<div class="section-content"><h2>Disenyo</h2><p>Mayroong madaling gamitin at intuitive na interface.</p></div>'
        },
        'integration': {
            'ja': '<div class="section-content"><h2>アプリ連携</h2><p>様々なアプリとシームレスに連携します。</p></div>',
            'en': '<div class="section-content"><h2>App Integration</h2><p>Seamless integration with various apps.</p></div>',
            'tl': '<div class="section-content"><h2>Pagsasama-sama ng mga App</h2><p>Walang kahirap-hirap na pagsasama sa iba\'t ibang app.</p></div>'
        },
        'toaster': {
            'ja': '<div class="section-content"><h2>ToasterMachine</h2><p>効率的なタスク管理を実現します。</p></div>',
            'en': '<div class="section-content"><h2>ToasterMachine</h2><p>Efficient task management solution.</p></div>',
            'tl': '<div class="section-content"><h2>ToasterMachine</h2><p>Mabisang solusyon sa pamamahala ng mga gawain.</p></div>'
        },
        'scr': {
            'ja': '<div class="section-content"><h2>SCRアプリ</h2><p>学校生活をサポートする様々な機能を提供します。</p></div>',
            'en': '<div class="section-content"><h2>SCR App</h2><p>Provides various features to support school life.</p></div>',
            'tl': '<div class="section-content"><h2>SCR App</h2><p>Nagbibigay ng iba\'t ibang tampok upang suportahan ang buhay sa paaralan.</p></div>'
        },
        'pickramu': {
            'ja': '<div class="section-content"><h2>Pickramu</h2><p>学習をより楽しくするツールです。</p></div>',
            'en': '<div class="section-content"><h2>Pickramu</h2><p>A tool to make learning more enjoyable.</p></div>',
            'tl': '<div class="section-content"><h2>Pickramu</h2><p>Isang kasangkapan upang gawing mas kasiya-siya ang pag-aaral.</p></div>'
        },
        'notea': {
            'ja': '<div class="section-content"><h2>Notea</h2><p>ノート取りを効率化するアプリケーションです。</p></div>',
            'en': '<div class="section-content"><h2>Notea</h2><p>An application to streamline note-taking.</p></div>',
            'tl': '<div class="section-content"><h2>Notea</h2><p>Isang aplikasyon upang gawing mas madali ang pagkuha ng mga tala.</p></div>'
        },
        'moralfruit': {
            'ja': '<div class="section-content"><h2>MoralFruit</h2><p>道徳教育をサポートするアプリです。</p></div>',
            'en': '<div class="section-content"><h2>MoralFruit</h2><p>An app to support moral education.</p></div>',
            'tl': '<div class="section-content"><h2>MoralFruit</h2><p>Isang app upang suportahan ang edukasyong moral.</p></div>'
        },
        'koodi': {
            'ja': '<div class="section-content"><h2>Koodi Studio</h2><p>プログラミング学習をサポートします。</p></div>',
            'en': '<div class="section-content"><h2>Koodi Studio</h2><p>Supports programming education.</p></div>',
            'tl': '<div class="section-content"><h2>Koodi Studio</h2><p>Sumusuporta sa edukasyon sa programming.</p></div>'
        },
        'skrift': {
            'ja': '<div class="section-content"><h2>Skrift</h2><p>文章作成をサポートするツールです。</p></div>',
            'en': '<div class="section-content"><h2>Skrift</h2><p>A tool to support writing.</p></div>',
            'tl': '<div class="section-content"><h2>Skrift</h2><p>Isang kasangkapan upang suportahan ang pagsusulat.</p></div>'
        },
        'cstore': {
            'ja': '<div class="section-content"><h2>CStore</h2><p>様々なアプリを入手できるストアです。</p></div>',
            'en': '<div class="section-content"><h2>CStore</h2><p>A store to get various apps.</p></div>',
            'tl': '<div class="section-content"><h2>CStore</h2><p>Isang tindahan upang makakuha ng iba\'t ibang app.</p></div>'
        },
        'security': {
            'ja': '<div class="section-content"><h2>セキュリティ</h2><p>強力なセキュリティ対策を講じています。</p></div>',
            'en': '<div class="section-content"><h2>Security</h2><p>Strong security measures are in place.</p></div>',
            'tl': '<div class="section-content"><h2>Seguridad</h2><p>Mayroong malalakas na hakbang sa seguridad.</p></div>'
        },
        'summary': {
            'ja': `
                <div class="section-content">
                    <h2>まとめ</h2>
                    <p>Deep-School は、学校生活をより良くするための包括的なソリューションです。</p>
                    <div class="cta-section">
                        <p>ご質問やご意見がございましたら、お気軽にお問い合わせください。</p>
                        <button class="cta-button" onclick="goBack()">言語選択に戻る</button>
                    </div>
                </div>
            `,
            'en': `
                <div class="section-content">
                    <h2>Summary</h2>
                    <p>Deep-School is a comprehensive solution to enhance school life.</p>
                    <div class="cta-section">
                        <p>If you have any questions or feedback, please feel free to contact us.</p>
                        <button class="cta-button" onclick="goBack()">Back to Language Selection</button>
                    </div>
                </div>
            `,
            'tl': `
                <div class="section-content">
                    <h2>Buod</h2>
                    <p>Ang Deep-School ay isang komprehensibong solusyon upang mapahusay ang buhay sa paaralan.</p>
                    <div class="cta-section">
                        <p>Kung mayroon kang anumang katanungan o puna, mangyaring huwag mag-atubiling makipag-ugnayan sa amin.</p>
                        <button class="cta-button" onclick="goBack()">Bumalik sa Pagpili ng Wika</button>
                    </div>
                </div>
            `
        }
    };
    
    // Add loading state
    container.innerHTML = '<div class="loading">読み込み中...</div>';
    
    // Simulate loading (in a real app, this would be an API call)
    setTimeout(() => {
        if (content[sectionId] && content[sectionId][currentLanguage]) {
            container.innerHTML = content[sectionId][currentLanguage];
            
            // Add animation class for content entrance
            const contentElements = container.querySelectorAll('.section-content > *');
            contentElements.forEach((el, index) => {
                el.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
                el.style.opacity = '0';
            });
        } else {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${{
                        'ja': 'コンテンツを読み込めませんでした。',
                        'en': 'Could not load content.',
                        'tl': 'Hindi ma-load ang nilalaman.'
                    }[currentLanguage] || 'Content not available.'}</p>
                </div>
            `;
        }
    }, 300);
}

// Function to go back to language selection
function goBack() {
    // Reset current section
    currentSection = 0;
    
    // Clear content container
    document.getElementById('content-container').innerHTML = '';
    
    // Hide navigation buttons
    document.querySelector('.nav-buttons').style.display = 'none';
    
    // Show language selection screen
    document.getElementById('language-screen').style.display = 'block';
    
    // Clear URL hash
    history.pushState('', document.title, window.location.pathname + window.location.search);
    
    // Scroll to top of the page
    window.scrollTo(0, 0);
}

// Function to navigate between sections
function navigate(direction) {
    if (!sectionsData.length) return;
    
    if (direction === 'prev' && currentSection > 0) {
        currentSection--;
    } else if (direction === 'next' && currentSection < sectionsData.length - 1) {
        currentSection++;
    }
    
    showSection(currentSection);
}

// Function to update navigation buttons state
function updateNavigation() {
    if (!sectionsData || !sectionsData.length) return;
    
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    const backBtn = document.querySelector('.nav-btn.back');
    
    if (prevBtn) {
        prevBtn.disabled = currentSection === 0;
        prevBtn.innerHTML = {
            'ja': '<i class="fas fa-arrow-left"></i> 前へ',
            'en': '<i class="fas fa-arrow-left"></i> Previous',
            'tl': '<i class="fas fa-arrow-left"></i> Nakaraan'
        }[currentLanguage] || '<i class="fas fa-arrow-left"></i> Previous';
    }
    
    if (nextBtn) {
        const isLastSection = currentSection === sectionsData.length - 1;
        nextBtn.disabled = isLastSection;
        
        if (isLastSection) {
            nextBtn.innerHTML = {
                'ja': '完了 <i class="fas fa-check"></i>',
                'en': 'Finish <i class="fas fa-check"></i>',
                'tl': 'Tapos na <i class="fas fa-check"></i>'
            }[currentLanguage] || 'Finish <i class="fas fa-check"></i>';
            nextBtn.classList.add('finish-btn');
        } else {
            nextBtn.innerHTML = {
                'ja': '次へ <i class="fas fa-arrow-right"></i>',
                'en': 'Next <i class="fas fa-arrow-right"></i>',
                'tl': 'Susunod <i class="fas fa-arrow-right"></i>'
            }[currentLanguage] || 'Next <i class="fas fa-arrow-right"></i>';
            nextBtn.classList.remove('finish-btn');
        }
    }
    
    // Update back button text based on language
    if (backBtn) {
        backBtn.innerHTML = `<i class="fas fa-chevron-left"></i> ${
            {
                'ja': '言語選択に戻る',
                'en': 'Back to Language',
                'tl': 'Bumalik sa Wika'
            }[currentLanguage] || 'Back to Language'
        }`;
    }
    
    // Update document title with current section
    updateDocumentTitle();
}

// Function to update document title based on current section and language
function updateDocumentTitle() {
    const sectionTitles = {
        'ja': ['はじめに', 'Deep-Schoolについて', 'デザイン', 'アプリ連携', 'ToasterMachine', 'SCRアプリ', 
              'Pickramu', 'Notea', 'MoralFruit', 'Koodi Studio', 'Skrift', 'CStore', 'セキュリティ', 'まとめ'],
        'en': ['Introduction', 'About Deep-School', 'Design', 'App Integration', 'ToasterMachine', 'SCR App', 
              'Pickramu', 'Notea', 'MoralFruit', 'Koodi Studio', 'Skrift', 'CStore', 'Security', 'Summary'],
        'tl': ['Panimula', 'Tungkol sa Deep-School', 'Disenyo', 'Pagsasama-sama ng mga App', 'ToasterMachine', 'SCR App', 
              'Pickramu', 'Notea', 'MoralFruit', 'Koodi Studio', 'Skrift', 'CStore', 'Seguridad', 'Buod']
    };
    
    const title = sectionTitles[currentLanguage]?.[currentSection] || 'Student Council Election';
    document.title = `${title} | 2025 後期生徒会選挙 - 杉山 瑳久哉`;
}

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load content from JSON
        await loadContent();
        
        // Initialize navigation
        updateNavigation();
    } catch (error) {
        console.error('Initialization error:', error);
        // Show error message to user
        const container = document.getElementById('content-container');
        if (container) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h1>Error Loading Content</h1>
                    </div>
                    <div class="card-body">
                        <p>申し訳ありませんが、コンテンツの読み込み中にエラーが発生しました。</p>
                        <p>Sorry, there was an error loading the content.</p>
                        <p>Paumanhin, may naganap na error sa pag-load ng content.</p>
                        <button onclick="window.location.reload()" class="nav-btn">
                            <i class="fas fa-sync-alt"></i> 再読み込み / Reload / I-reload
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Check for hash in URL to handle direct linking
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        const sectionIndex = sectionsData.findIndex(section => section.id === sectionId);
        if (sectionIndex !== -1) {
            currentSection = sectionIndex;
            showSection(currentSection);
        }
    }
});
