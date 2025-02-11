// State Management
const state = {
    siteTitle: 'منصة المسابقات',
    adminPassword: '12345',
    currentPage: 'home',
    currentCompetition: null,
    currentParticipant: null,
    competitions: [],
    questions: []
};

// Page Templates
const pageTemplates = {
    home: `
        <div class="card">
            <div class="card-body">
                <h2 class="card-title">مرحبًا بك في منصة المسابقات</h2>
                <p class="card-text">اختر مسابقتك واستعد للتحدي!</p>
                <button onclick="navigateTo('competitions')" class="btn btn-primary">استعرض المسابقات</button>
            </div>
        </div>
    `,
    competitions: `
        <div class="card">
            <div class="card-body">
                <h2 class="card-title mb-4">المسابقات المتاحة</h2>
                <div id="competitionsList" class="row">
                    <!-- سيتم إضافة المسابقات هنا -->
                </div>
            </div>
        </div>
    `,
    admin: `
        <div class="card">
            <div class="card-body">
                <div id="adminLogin">
                    <h2 class="card-title mb-4">لوحة التحكم الإدارية</h2>
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="adminPassword" class="form-label">كلمة المرور</label>
                            <input type="password" class="form-control" id="adminPassword" required>
                        </div>
                        <button type="submit" class="btn btn-success">تسجيل الدخول</button>
                    </form>
                </div>
                <div id="dashboardContent" style="display: none;">
                    <div class="row">
                        <div class="col-md-6">
                            <h2 class="card-title mb-4">إنشاء مسابقة جديدة</h2>
                            <form id="competitionForm">
                                <div class="mb-3">
                                    <label for="competitionTitle" class="form-label">عنوان المسابقة</label>
                                    <input type="text" class="form-control" id="competitionTitle" required>
                                </div>
                                <div class="mb-3">
                                    <label for="startDateTime" class="form-label">تاريخ البدء</label>
                                    <input type="datetime-local" class="form-control" id="startDateTime" required>
                                </div>
                                <div class="mb-3">
                                    <label for="endDateTime" class="form-label">تاريخ الانتهاء</label>
                                    <input type="datetime-local" class="form-control" id="endDateTime" required>
                                </div>
                                <div class="mb-3">
                                    <label for="competitionStatus" class="form-label">الحالة</label>
                                    <select class="form-select" id="competitionStatus">
                                        <option value="active">نشطة</option>
                                        <option value="inactive">غير نشطة</option>
                                    </select>
                                </div>
                                
                                <!-- قسم إضافة الأسئلة -->
                                <div class="mb-3">
                                    <label class="form-label">الأسئلة</label>
                                    <div id="questionsContainer">
                                        <!-- سيتم إضافة الأسئلة هنا ديناميكيًا -->
                                    </div>
                                    <button type="button" id="addQuestionBtn" class="btn btn-secondary mt-2">
                                        إضافة سؤال جديد
                                    </button>
                                </div>
                                
                                <button type="submit" class="btn btn-primary">إنشاء المسابقة</button>
                            </form>
                        </div>
                        <div class="col-md-6">
                            <h2 class="card-title mb-4">المسابقات الحالية</h2>
                            <div id="adminCompetitionsList" class="list-group">
                                <!-- سيتم إضافة المسابقات هنا تلقائيًا -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    leaderboard: `
        <div class="card">
            <div class="card-body">
                <h2 class="card-title mb-4">لوحة المتصدرين</h2>
                <div id="leaderboardContainer">
                    <!-- سيتم إضافة المتصدرين هنا -->
                </div>
            </div>
        </div>
    `,
    participantRegistration: `
        <div class="card">
            <div class="card-body">
                <h2 class="card-title mb-4">تسجيل المشاركين</h2>
                <form id="participantForm">
                    <div class="mb-3">
                        <label for="participantName" class="form-label">اسم المشارك</label>
                        <input type="text" class="form-control" id="participantName" required>
                    </div>
                    <div class="mb-3">
                        <label for="participantMobile" class="form-label">رقم الجوال</label>
                        <input type="text" class="form-control" id="participantMobile" required>
                    </div>
                    <button type="submit" class="btn btn-primary">تسجيل المشارك</button>
                </form>
            </div>
        </div>
    `
};

// Enhanced Navigation Setup
function setupNavigation() {
    console.log('Setting up Navigation Handlers');
    
    // Direct event binding method
    function bindNavigationEvent(selector, page) {
        const buttons = document.querySelectorAll(selector);
        console.log(`Binding navigation for ${page}. Buttons found: ${buttons.length}`);
        
        buttons.forEach(button => {
            // Remove any existing listeners to prevent multiple bindings
            button.removeEventListener('click', navigationHandler);
            button.addEventListener('click', navigationHandler);
            
            console.log(`Navigation listener added to button: ${button.textContent}`);
        });
    }
    
    // Universal navigation handler
    function navigationHandler(event) {
        event.preventDefault(); // Prevent default button behavior
        
        // Extract page from onclick attribute or data attribute
        let page = event.currentTarget.getAttribute('onclick');
        if (page) {
            page = page.match(/'([^']*)'/)[1];
        } else {
            page = event.currentTarget.getAttribute('data-page');
        }
        
        console.log(`Navigation triggered for page: ${page}`);
        navigateTo(page);
    }
    
    // Bind navigation for all buttons
    bindNavigationEvent('[onclick^="navigateTo"]', 'All Pages');
    
    // Fallback method: add data-page attribute support
    const navButtons = document.querySelectorAll('.nav-buttons button');
    navButtons.forEach(button => {
        if (!button.getAttribute('onclick')) {
            const page = button.textContent.includes('لوحة التحكم') ? 'admin' : 
                         button.textContent.includes('المتصدرين') ? 'leaderboard' : 
                         button.textContent.includes('الرئيسية') ? 'home' : null;
            
            if (page) {
                button.setAttribute('data-page', page);
                button.addEventListener('click', navigationHandler);
                console.log(`Added fallback navigation for: ${page}`);
            }
        }
    });
}

// Enhanced Navigation Function
function navigateTo(page) {
    console.log(`Attempting to navigate to: ${page}`);
    
    // Validate page
    const validPages = ['home', 'participant', 'competition', 'leaderboard', 'admin'];
    if (!validPages.includes(page)) {
        console.error(`Invalid page: ${page}. Defaulting to home.`);
        page = 'home';
    }

    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(pageEl => {
        pageEl.classList.remove('active');
        console.log(`Hiding page: ${pageEl.id}`);
    });

    // Show target page
    const targetPage = document.getElementById(`${page}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log(`Showing page: ${targetPage.id}`);
        
        // Special handling for admin page
        if (page === 'admin') {
            initAdminPage();
        }
    } else {
        console.error(`Page not found: ${page}Page`);
        // Fallback to home page
        const homePage = document.getElementById('homePage');
        if (homePage) {
            homePage.classList.add('active');
            console.log('Fallback to home page');
        }
    }

    // Page-specific actions
    switch(page) {
        case 'leaderboard':
            const leaderboardContainer = document.getElementById('leaderboardContainer');
            if (leaderboardContainer) {
                leaderboardContainer.innerHTML = '<p>جاري تحميل المتصدرين...</p>';
            }
            break;
        
        case 'home':
            loadCompetitions();
            break;
    }

    // Update state
    state.currentPage = page;
}

// Detailed Admin Page Initialization
function initAdminPage() {
    console.log('Initializing Admin Page');
    
    // Get admin page elements
    const adminPage = document.getElementById('adminPage');
    const adminLogin = document.getElementById('adminLogin');
    const dashboardContent = document.getElementById('dashboardContent');
    const loginForm = document.getElementById('loginForm');
    
    // Debug: Log admin page elements
    console.log('Admin Page Elements:');
    console.log('adminPage:', !!adminPage);
    console.log('adminLogin:', !!adminLogin);
    console.log('dashboardContent:', !!dashboardContent);
    console.log('loginForm:', !!loginForm);
    
    // Ensure all elements exist
    if (!adminPage || !adminLogin || !dashboardContent || !loginForm) {
        console.error('Missing admin page elements');
        return;
    }
    
    // Reset admin page state
    adminLogin.style.display = 'block';
    dashboardContent.style.display = 'none';
    
    // Login form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get password input
        const passwordInput = document.getElementById('adminPassword');
        const enteredPassword = passwordInput ? passwordInput.value : '';
        
        console.log('Login Attempt:');
        console.log('Entered Password:', enteredPassword);
        console.log('Stored Admin Password:', state.adminPassword);
        
        // Check password
        if (enteredPassword === state.adminPassword) {
            console.log('Admin Login Successful');
            adminLogin.style.display = 'none';
            dashboardContent.style.display = 'block';
            
            // Load admin competitions
            loadAdminCompetitions();
        } else {
            console.error('Admin Login Failed');
            alert('كلمة المرور غير صحيحة');
        }
    });
}

// Load Admin Competitions
function loadAdminCompetitions() {
    console.log('Loading Admin Competitions');
    
    const adminCompetitionsList = document.getElementById('adminCompetitionsList');
    if (!adminCompetitionsList) {
        console.error('Admin Competitions List Element Not Found');
        return;
    }
    
    // Clear existing competitions
    adminCompetitionsList.innerHTML = '';
    
    // Fetch competitions from IndexedDB
    competitionDB.getCompetitions().then(competitions => {
        console.log('Competitions Loaded:', competitions.length);
        
        if (competitions.length === 0) {
            adminCompetitionsList.innerHTML = '<p>لا توجد مسابقات حاليًا</p>';
            return;
        }
        
        // Populate competitions list
        competitions.forEach(competition => {
            const competitionItem = document.createElement('div');
            competitionItem.classList.add('list-group-item', 'list-group-item-action');
            competitionItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${competition.title}</h5>
                    <small class="badge ${competition.status === 'active' ? 'bg-success' : 'bg-warning'}">
                        ${competition.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </small>
                </div>
                <p class="mb-1">
                    <strong>بداية المسابقة:</strong> ${new Date(competition.startDate).toLocaleDateString()}<br>
                    <strong>نهاية المسابقة:</strong> ${new Date(competition.endDate).toLocaleDateString()}
                </p>
            `;
            
            adminCompetitionsList.appendChild(competitionItem);
        });
    }).catch(error => {
        console.error('Error Loading Competitions:', error);
        adminCompetitionsList.innerHTML = '<p>خطأ في تحميل المسابقات</p>';
    });
}

// Ensure navigation is set up after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Fully Loaded: Setting up Navigation');
    
    // Enhanced navigation setup
    setupNavigation();

    // Initialize page to home on first load
    console.log('Initializing First Page Load');
    navigateTo('home');
});

// Debugging function to log detailed page information
function debugPageStatus() {
    console.log('=== PAGE STATUS DEBUG ===');
    
    // Check page elements
    const pageElements = document.querySelectorAll('.page');
    console.log(`Total Page Elements: ${pageElements.length}`);
    
    pageElements.forEach(page => {
        console.log(`Page ID: ${page.id}`);
        console.log(`Is Active: ${page.classList.contains('active')}`);
    });

    // Check navigation buttons
    const navButtons = document.querySelectorAll('[onclick^="navigateTo"]');
    console.log(`Navigation Buttons Found: ${navButtons.length}`);
    navButtons.forEach(button => {
        console.log(`Button Text: ${button.textContent}`);
        console.log(`Button Onclick: ${button.getAttribute('onclick')}`);
    });
}

// Competition Database Management
class CompetitionDatabase {
    constructor() {
        this.dbName = 'CompetitionPlatform';
        this.dbVersion = 2; // Increased version to support questions
        this.db = null;
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Competitions Store
                if (!db.objectStoreNames.contains('competitions')) {
                    const competitionStore = db.createObjectStore('competitions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    competitionStore.createIndex('title', 'title', { unique: false });
                    competitionStore.createIndex('status', 'status', { unique: false });
                }

                // Questions Store
                if (!db.objectStoreNames.contains('questions')) {
                    const questionStore = db.createObjectStore('questions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    questionStore.createIndex('competitionId', 'competitionId', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async getCompetitions() {
        await this.initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['competitions'], 'readonly');
            const store = transaction.objectStore('competitions');
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async getQuestionsByCompetitionId(competitionId) {
        await this.initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions'], 'readonly');
            const store = transaction.objectStore('questions');
            const index = store.index('competitionId');
            const request = index.getAll(competitionId);

            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async addCompetition(competition) {
        await this.initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['competitions', 'questions'], 'readwrite');
            const competitionStore = transaction.objectStore('competitions');
            const questionStore = transaction.objectStore('questions');

            const fullCompetition = {
                ...competition,
                createdAt: new Date().toISOString()
            };

            const competitionRequest = competitionStore.add(fullCompetition);

            competitionRequest.onsuccess = (event) => {
                const competitionId = event.target.result;

                // إضافة الأسئلة المرتبطة بالمسابقة
                const questions = competition.questions || [];
                const questionPromises = questions.map(question => {
                    const fullQuestion = {
                        ...question,
                        competitionId: competitionId
                    };
                    return new Promise((resolve, reject) => {
                        const questionRequest = questionStore.add(fullQuestion);
                        questionRequest.onsuccess = () => resolve();
                        questionRequest.onerror = () => reject();
                    });
                });

                Promise.all(questionPromises)
                    .then(() => resolve(competitionId))
                    .catch(reject);
            };

            competitionRequest.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
}

// Initialize Database
const competitionDB = new CompetitionDatabase();

// Load Competitions
async function loadCompetitions() {
    const competitionsList = document.getElementById('competitionsList');
    
    try {
        const competitions = await competitionDB.getCompetitions();
        
        if (competitions.length === 0) {
            // إضافة مسابقات تجريبية
            const defaultCompetitions = [
                {
                    title: "مسابقة الذكاء الاصطناعي",
                    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "active",
                    questions: [
                        {
                            text: "ما هو الذكاء الاصطناعي؟",
                            type: "multiple-choice",
                            choices: [
                                "برنامج كمبيوتر يحاكي الذكاء البشري",
                                "روبوت متطور",
                                "شبكة كمبيوتر معقدة"
                            ],
                            correctAnswer: 0
                        }
                    ]
                }
            ];

            for (const comp of defaultCompetitions) {
                await competitionDB.addCompetition(comp);
            }

            // إعادة تحميل المسابقات
            return loadCompetitions();
        }

        competitionsList.innerHTML = await Promise.all(competitions.map(async (competition) => {
            // جلب الأسئلة المرتبطة بالمسابقة
            const questions = await competitionDB.getQuestionsByCompetitionId(competition.id);
            
            return `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${competition.title}</h5>
                            <p class="card-text">
                                <strong>بداية المسابقة:</strong> ${new Date(competition.startDate).toLocaleDateString()}<br>
                                <strong>نهاية المسابقة:</strong> ${new Date(competition.endDate).toLocaleDateString()}<br>
                                <strong>عدد الأسئلة:</strong> ${questions.length}<br>
                                <span class="badge ${competition.status === 'active' ? 'bg-success' : 'bg-warning'}">
                                    ${competition.status === 'active' ? 'نشطة' : 'غير نشطة'}
                                </span>
                            </p>
                            <button onclick="startCompetition('${competition.id}')" 
                                    class="btn btn-primary ${competition.status !== 'active' ? 'disabled' : ''}">
                                ${competition.status === 'active' ? 'ابدأ المسابقة' : 'المسابقة غير نشطة'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        })).then(htmlArray => htmlArray.join(''));
    } catch (error) {
        console.error('خطأ في تحميل المسابقات:', error);
    }
}

// Start Competition
function startCompetition(competitionId) {
    // يمكنك إضافة منطق بدء المسابقة هنا
    alert('سيتم إضافة تفاصيل المسابقة قريبًا');
}

// Initialize Admin Page
function initAdminPage() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;

        if (password === state.adminPassword) {
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'block';
        } else {
            alert('كلمة المرور غير صحيحة');
        }
    });

    // إضافة أسئلة ديناميكيًا
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    
    addQuestionBtn.addEventListener('click', () => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-2';
        questionDiv.innerHTML = `
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">نص السؤال</label>
                    <input type="text" class="form-control question-text" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">نوع السؤال</label>
                    <select class="form-select question-type">
                        <option value="multiple-choice">اختيار من متعدد</option>
                        <option value="text">إجابة نصية</option>
                    </select>
                </div>
                <div class="choices-container">
                    <div class="mb-3">
                        <label class="form-label">الخيارات</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control choice-input" placeholder="أدخل الخيار">
                            <button class="btn btn-secondary add-choice" type="button">+</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger remove-question">حذف السؤال</button>
            </div>
        `;

        // إضافة خيارات جديدة
        const choicesContainer = questionDiv.querySelector('.choices-container');
        const addChoiceBtn = questionDiv.querySelector('.add-choice');
        
        addChoiceBtn.addEventListener('click', () => {
            const choiceInput = document.createElement('div');
            choiceInput.className = 'input-group mb-2';
            choiceInput.innerHTML = `
                <input type="text" class="form-control choice-input" placeholder="أدخل الخيار">
                <button class="btn btn-danger remove-choice" type="button">-</button>
            `;
            
            choiceInput.querySelector('.remove-choice').addEventListener('click', () => {
                choiceInput.remove();
            });
            
            choicesContainer.appendChild(choiceInput);
        });

        // حذف السؤال
        questionDiv.querySelector('.remove-question').addEventListener('click', () => {
            questionDiv.remove();
        });

        questionsContainer.appendChild(questionDiv);
    });

    const competitionForm = document.getElementById('competitionForm');
    competitionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // جمع بيانات المسابقة
        const title = document.getElementById('competitionTitle').value;
        const startDate = document.getElementById('startDateTime').value;
        const endDate = document.getElementById('endDateTime').value;
        const status = document.getElementById('competitionStatus').value;

        // جمع الأسئلة
        const questions = Array.from(questionsContainer.children).map(questionDiv => {
            const questionText = questionDiv.querySelector('.question-text').value;
            const questionType = questionDiv.querySelector('.question-type').value;
            
            const choiceInputs = questionDiv.querySelectorAll('.choice-input');
            const choices = Array.from(choiceInputs).map(input => input.value).filter(choice => choice.trim() !== '');

            return {
                text: questionText,
                type: questionType,
                choices: choices,
                correctAnswer: 0 // يمكن تحسينه لاحقًا
            };
        });

        try {
            await competitionDB.addCompetition({ 
                title, 
                startDate, 
                endDate, 
                status,
                questions 
            });
            
            alert('تم إنشاء المسابقة بنجاح');
            competitionForm.reset();
            questionsContainer.innerHTML = ''; // مسح الأسئلة
            loadCompetitions(); // تحديث قائمة المسابقات
        } catch (error) {
            console.error('خطأ في إضافة المسابقة:', error);
            alert('حدث خطأ أثناء إضافة المسابقة');
        }
    });
}

// Load Leaderboard
function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    // سيتم إضافة منطق عرض المتصدرين هنا
    leaderboardContainer.innerHTML = `
        <div class="alert alert-info">
            سيتم إضافة لوحة المتصدرين قريبًا
        </div>
    `;
}

// Initialize Participant Registration
function initParticipantRegistration() {
    const participantForm = document.getElementById('participantForm');
    participantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const participantName = document.getElementById('participantName').value;
        const participantMobile = document.getElementById('participantMobile').value;

        // Validate input
        if (!participantName || !participantMobile) {
            alert('يرجى إدخال الاسم ورقم الجوال');
            return;
        }

        // Store participant details (you can expand this logic)
        state.currentParticipant = {
            name: participantName,
            mobile: participantMobile
        };

        // Redirect or perform next action
        window.location.href = 'competition.html';
    });
}

// Initialize Page on Load
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الصفحة الرئيسية عند بدء التشغيل
    navigateTo('home');
});

// دالة التنقل بين الصفحات
function navigateTo(page) {
    // إخفاء جميع الصفحات
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.style.display = 'none');

    // عرض الصفحة المطلوبة
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.style.display = 'block';
    }

    // تحميل المحتوى الخاص بكل صفحة
    switch(page) {
        case 'adminPage':
            loadAdminCompetitions();
            break;
        case 'leaderboardPage':
            loadLeaderboard();
            break;
        case 'competitionsPage':
            loadCompetitions();
            break;
    }
}

// دالة تحميل المسابقات في لوحة التحكم
function loadAdminCompetitions() {
    console.log('تحميل المسابقات في لوحة التحكم');
    const adminCompetitionsContainer = document.getElementById('adminCompetitionsContainer');
    
    if (!adminCompetitionsContainer) {
        console.error('عنصر حاوية المسابقات الإدارية غير موجود');
        return;
    }

    // مسح المحتوى الحالي
    adminCompetitionsContainer.innerHTML = '';

    // جلب المسابقات من قاعدة البيانات
    competitionDB.getCompetitions()
        .then(competitions => {
            if (competitions.length === 0) {
                adminCompetitionsContainer.innerHTML = '<p>لا توجد مسابقات حاليًا</p>';
                return;
            }

            // عرض المسابقات
            competitions.forEach(competition => {
                const competitionCard = document.createElement('div');
                competitionCard.className = 'card mb-3';
                competitionCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${competition.title}</h5>
                        <p class="card-text">
                            تاريخ البدء: ${competition.startDate}<br>
                            تاريخ الانتهاء: ${competition.endDate}<br>
                            الحالة: ${competition.status}<br>
                            عدد الأسئلة: ${competition.questions.length}
                        </p>
                        <div class="btn-group">
                            <button class="btn btn-warning edit-competition" data-id="${competition.id}">تعديل</button>
                            <button class="btn btn-danger delete-competition" data-id="${competition.id}">حذف</button>
                        </div>
                    </div>
                `;
                adminCompetitionsContainer.appendChild(competitionCard);
            });
        })
        .catch(error => {
            console.error('خطأ في تحميل المسابقات:', error);
            adminCompetitionsContainer.innerHTML = '<p>حدث خطأ أثناء تحميل المسابقات</p>';
        });
}

// دالة تحميل المتصدرين
function loadLeaderboard() {
    console.log('تحميل لوحة المتصدرين');
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    
    if (!leaderboardContainer) {
        console.error('عنصر حاوية المتصدرين غير موجود');
        return;
    }

    // مسح المحتوى الحالي
    leaderboardContainer.innerHTML = '';

    // في المستقبل، سيتم استبدال هذا بالمنطق الفعلي لحساب المتصدرين
    leaderboardContainer.innerHTML = `
        <div class="alert alert-info">
            سيتم تطبيق نظام تسجيل النقاط والمتصدرين قريبًا
        </div>
    `;
}

// دالة تحميل المسابقات
function loadCompetitions() {
    console.log('تحميل المسابقات');
    const competitionsContainer = document.getElementById('competitionsContainer');
    
    if (!competitionsContainer) {
        console.error('عنصر حاوية المسابقات غير موجود');
        return;
    }

    // مسح المحتوى الحالي
    competitionsContainer.innerHTML = '';

    // جلب المسابقات من قاعدة البيانات
    competitionDB.getCompetitions()
        .then(competitions => {
            if (competitions.length === 0) {
                competitionsContainer.innerHTML = '<p>لا توجد مسابقات حاليًا</p>';
                return;
            }

            // عرض المسابقات
            competitions.forEach(competition => {
                const competitionCard = document.createElement('div');
                competitionCard.className = 'card mb-3';
                competitionCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${competition.title}</h5>
                        <p class="card-text">
                            تاريخ البدء: ${competition.startDate}<br>
                            تاريخ الانتهاء: ${competition.endDate}<br>
                            الحالة: ${competition.status}
                        </p>
                        <button class="btn btn-primary start-competition" data-id="${competition.id}">
                            بدء المسابقة
                        </button>
                    </div>
                `;
                competitionsContainer.appendChild(competitionCard);
            });
        })
        .catch(error => {
            console.error('خطأ في تحميل المسابقات:', error);
            competitionsContainer.innerHTML = '<p>حدث خطأ أثناء تحميل المسابقات</p>';
        });
}

// إعداد الملاحة
function setupNavigation() {
    // إضافة معالجات الأحداث للروابط
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            navigateTo(targetPage);
        });
    });

    // تحميل الصفحة الرئيسية افتراضيًا
    navigateTo('competitionsPage');
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
});
