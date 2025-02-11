// Competitions Management
class CompetitionDatabase {
    constructor() {
        this.STORAGE_KEY = 'competitions_database';
        this.db = null;
    }

    // Initialize or get existing competitions
    async initDatabase() {
        if (this.db) return;

        const request = indexedDB.open('competitions_db', 1);

        request.onupgradeneeded = event => {
            this.db = event.target.result;

            const competitionsStore = this.db.createObjectStore('competitions', {
                keyPath: 'id',
                autoIncrement: true
            });

            competitionsStore.createIndex('title', 'title', { unique: false });
            competitionsStore.createIndex('startDate', 'startDate', { unique: false });
            competitionsStore.createIndex('endDate', 'endDate', { unique: false });
            competitionsStore.createIndex('status', 'status', { unique: false });
            competitionsStore.createIndex('createdAt', 'createdAt', { unique: false });
        };

        request.onsuccess = event => {
            this.db = event.target.result;
        };

        request.onerror = event => {
            console.error('Error opening database:', event.target.error);
        };
    }

    async getCompetitions() {
        await this.initDatabase();

        return new Promise(resolve => {
            const transaction = this.db.transaction('competitions', 'readonly');
            const store = transaction.objectStore('competitions');
            const request = store.getAll();

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                console.error('Error getting competitions:', event.target.error);
                resolve([]);
            };
        });
    }

    async addCompetition(competition) {
        await this.initDatabase();

        return new Promise(resolve => {
            const transaction = this.db.transaction('competitions', 'readwrite');
            const store = transaction.objectStore('competitions');
            const request = store.add({
                title: competition.title,
                startDate: competition.startDate,
                endDate: competition.endDate,
                status: competition.status,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = event => {
                resolve(event.target.result);
            };

            request.onerror = event => {
                console.error('Error adding competition:', event.target.error);
                resolve(null);
            };
        });
    }

    async clearAllData() {
        await this.initDatabase();

        return new Promise(resolve => {
            const transaction = this.db.transaction('competitions', 'readwrite');
            const store = transaction.objectStore('competitions');
            const request = store.clear();

            request.onsuccess = event => {
                resolve();
            };

            request.onerror = event => {
                console.error('Error clearing data:', event.target.error);
            };
        });
    }
}

// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Ensure CompetitionDatabase is available
    if (!window.CompetitionDatabase) {
        console.error('CompetitionDatabase is not loaded');
        return;
    }

    const competitionDB = new CompetitionDatabase();
    
    const loginForm = document.getElementById('loginForm');
    const dashboardContent = document.getElementById('dashboardContent');
    const competitionForm = document.getElementById('competitionForm');
    const competitionsList = document.getElementById('competitionsList');

    // Initialize database
    competitionDB.initDatabase().then(() => {
        console.log('✅ Database initialized in admin.js');

        // Login Form
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const passwordInput = document.getElementById('adminPassword').value;

                if (passwordInput === '12345') {
                    document.getElementById('adminLogin').style.display = 'none';
                    dashboardContent.style.display = 'block';
                    loadCompetitions();
                } else {
                    alert('كلمة المرور غير صحيحة');
                }
            });
        }

        // Competition Form
        if (competitionForm) {
            competitionForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('competitionTitle').value;
                const startDate = document.getElementById('startDateTime').value;
                const endDate = document.getElementById('endDateTime').value;
                const status = document.getElementById('competitionStatus').value;

                const competition = {
                    title,
                    startDate,
                    endDate,
                    status
                };

                try {
                    const competitionId = await competitionDB.addCompetition(competition);
                    
                    if (competitionId) {
                        alert('تم إنشاء المسابقة بنجاح');
                        competitionForm.reset();
                        loadCompetitions();
                    }
                } catch (error) {
                    console.error('خطأ في إنشاء المسابقة:', error);
                    alert('حدث خطأ أثناء إنشاء المسابقة');
                }
            });
        }

        // Load Competitions Function
        async function loadCompetitions() {
            if (!competitionsList) return;

            try {
                const competitions = await competitionDB.getCompetitions();
                competitionsList.innerHTML = '';

                if (competitions.length === 0) {
                    const noCompetitionsMessage = document.createElement('div');
                    noCompetitionsMessage.className = 'alert alert-info text-center';
                    noCompetitionsMessage.textContent = 'لا توجد مسابقات حتى الآن';
                    competitionsList.appendChild(noCompetitionsMessage);
                    return;
                }

                competitions.forEach(competition => {
                    const competitionCard = document.createElement('div');
                    competitionCard.className = 'card mb-3 shadow-sm';
                    
                    // تنسيق التاريخ
                    const formatDate = (dateString) => {
                        try {
                            return new Date(dateString).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        } catch {
                            return dateString;
                        }
                    };

                    competitionCard.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title text-primary">${competition.title}</h5>
                            <p class="card-text">
                                <strong>تاريخ البدء:</strong> ${formatDate(competition.startDate)}<br>
                                <strong>تاريخ الانتهاء:</strong> ${formatDate(competition.endDate)}<br>
                                <strong>الحالة:</strong> 
                                <span class="badge ${competition.status === 'active' ? 'bg-success' : 'bg-warning'}">
                                    ${competition.status === 'active' ? 'نشطة' : 'غير نشطة'}
                                </span>
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    تاريخ الإنشاء: ${formatDate(competition.createdAt)}
                                </small>
                            </div>
                        </div>
                    `;

                    competitionsList.appendChild(competitionCard);
                });
            } catch (error) {
                console.error('❌ خطأ في تحميل المسابقات:', error);
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger text-center';
                errorMessage.textContent = 'حدث خطأ في تحميل المسابقات. يرجى المحاولة مرة أخرى.';
                competitionsList.appendChild(errorMessage);
            }
        }

        // إعادة تحميل المسابقات عند تحميل الصفحة
        if (competitionsList) {
            loadCompetitions();
        }
    }).catch(error => {
        console.error('Database initialization failed:', error);
        alert('فشل تهيئة قاعدة البيانات');
    });
});
