// Advanced Persistent Storage Management
class CompetitionDatabase {
    constructor() {
        this.dbName = 'CompetitionPlatform';
        this.db = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        // Diagnostic logging configuration
        this.diagnosticMode = true;
        this.diagnosticLogs = [];

        // Persistent storage configuration
        this.storageKey = {
            competitions: 'competition_db_backup_competitions',
            metadata: 'competition_db_backup_metadata'
        };
        this.backupInterval = 5 * 60 * 1000; // 5 minutes
    }

    // Enhanced Logging Method
    _log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        
        // Store diagnostic logs
        if (this.diagnosticMode) {
            this.diagnosticLogs.push({ timestamp, message, type });
        }

        switch(type) {
            case 'info':
                console.log(`ℹ️ ${logMessage}`);
                break;
            case 'warn':
                console.warn(`⚠️ ${logMessage}`);
                break;
            case 'error':
                console.error(`❌ ${logMessage}`);
                break;
        }
    }

    // Comprehensive Backup to localStorage
    async backupToLocalStorage() {
        try {
            const competitions = await this.getCompetitions();
            
            if (competitions.length > 0) {
                const backupData = {
                    timestamp: new Date().toISOString(),
                    competitions: competitions
                };

                // Separate storage for competitions and metadata
                localStorage.setItem(this.storageKey.competitions, JSON.stringify(competitions));
                localStorage.setItem(this.storageKey.metadata, JSON.stringify({
                    timestamp: backupData.timestamp,
                    count: competitions.length
                }));

                this._log(`Backed up ${competitions.length} competitions to localStorage`);
                
                // Verify backup
                const verifyBackup = JSON.parse(localStorage.getItem(this.storageKey.competitions));
                this._log(`Verification: Backed up ${verifyBackup.length} competitions`);
            } else {
                this._log('No competitions to backup', 'warn');
            }
        } catch (error) {
            this._log(`Comprehensive backup to localStorage failed: ${error}`, 'error');
        }
    }

    // Enhanced Restore from localStorage
    async restoreFromLocalStorage() {
        try {
            console.group('🔍 Comprehensive Restore Diagnostic');
            
            // Log localStorage contents for debugging
            console.log('Full localStorage:', {...localStorage});
            
            const competitionsJson = localStorage.getItem(this.storageKey.competitions);
            const metadataJson = localStorage.getItem(this.storageKey.metadata);
            
            console.log('Competitions JSON:', competitionsJson);
            console.log('Metadata JSON:', metadataJson);
            
            if (!competitionsJson) {
                console.warn('No competitions found in localStorage');
                console.groupEnd();
                return false;
            }
            
            if (!metadataJson) {
                console.warn('No metadata found in localStorage');
                console.groupEnd();
                return false;
            }
            
            let competitions, metadata;
            try {
                competitions = JSON.parse(competitionsJson);
                metadata = JSON.parse(metadataJson);
            } catch (parseError) {
                console.error('JSON Parsing Error:', parseError);
                console.log('Raw Competitions JSON:', competitionsJson);
                console.log('Raw Metadata JSON:', metadataJson);
                console.groupEnd();
                return false;
            }
            
            console.log('Parsed Competitions:', competitions);
            console.log('Parsed Metadata:', metadata);
            
            // Detailed backup age check
            const backupAge = new Date() - new Date(metadata.timestamp);
            const MAX_BACKUP_AGE = 24 * 60 * 60 * 1000; // 24 hours
            
            console.log('Backup Age (ms):', backupAge);
            console.log('Max Backup Age (ms):', MAX_BACKUP_AGE);
            
            if (backupAge > MAX_BACKUP_AGE) {
                console.warn('Backup is too old, skipping restore');
                console.groupEnd();
                return false;
            }
            
            // Comprehensive restore process
            console.log(`Attempting to restore ${competitions.length} competitions`);

            // Clear existing competitions
            await this.clearAllCompetitions();

            // Restore each competition with detailed logging
            let restoredCount = 0;
            let failedCompetitions = [];
            
            for (const competition of competitions) {
                try {
                    console.log('Attempting to restore competition:', competition);
                    await this.addCompetition(competition);
                    restoredCount++;
                } catch (restoreError) {
                    console.error(`Failed to restore competition: ${JSON.stringify(competition)}. Error:`, restoreError);
                    failedCompetitions.push({competition, error: restoreError});
                }
            }

            console.log(`Successfully restored ${restoredCount} out of ${competitions.length} competitions`);
            console.log('Failed Competitions:', failedCompetitions);
            
            console.groupEnd();
            
            return restoredCount > 0;
        } catch (error) {
            console.error('Comprehensive restore from localStorage failed:', error);
            console.groupEnd();
            return false;
        }
    }

    // Robust Database Initialization
    async initDatabase() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = new Promise(async (resolve, reject) => {
            try {
                const request = indexedDB.open(this.dbName, 6); // Increment version for changes

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    // Ensure competitions store exists with comprehensive configuration
                    if (!db.objectStoreNames.contains('competitions')) {
                        const store = db.createObjectStore('competitions', { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        
                        // Comprehensive indexing
                        store.createIndex('title', 'title', { unique: false });
                        store.createIndex('status', 'status', { unique: false });
                        store.createIndex('createdAt', 'createdAt', { unique: false });
                        store.createIndex('startDate', 'startDate', { unique: false });
                        store.createIndex('endDate', 'endDate', { unique: false });
                    }
                };

                request.onsuccess = async (event) => {
                    this.db = event.target.result;
                    this.isInitialized = true;

                    // Comprehensive restore strategy
                    const competitions = await this.getCompetitions();
                    this._log(`Initial database state: ${competitions.length} competitions`);

                    if (competitions.length === 0) {
                        this._log('Database is empty. Attempting to restore from localStorage');
                        const restoredFromBackup = await this.restoreFromLocalStorage();
                        
                        if (!restoredFromBackup) {
                            this._log('Restore from localStorage failed or no backup available', 'warn');
                        }
                    }

                    // Setup periodic backup with comprehensive error handling
                    const backupTimer = setInterval(() => {
                        try {
                            this.backupToLocalStorage();
                        } catch (backupError) {
                            this._log(`Periodic backup failed: ${backupError}`, 'error');
                            // Optional: Clear interval if repeated failures
                            clearInterval(backupTimer);
                        }
                    }, this.backupInterval);

                    resolve(this.db);
                };

                request.onerror = (event) => {
                    this._log(`Comprehensive database initialization error: ${event.target.error}`, 'error');
                    reject(event.target.error);
                };
            } catch (error) {
                this._log(`Critical initialization error: ${error}`, 'error');
                reject(error);
            }
        });

        return this.initializationPromise;
    }

    // Comprehensive Competition Addition
    async addCompetition(competition) {
        if (!this.isInitialized) {
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['competitions'], 'readwrite');
                const store = transaction.objectStore('competitions');
                
                // Comprehensive competition object with extensive fallback and validation
                const completeCompetition = {
                    title: competition.title || 'مسابقة بدون عنوان',
                    startDate: competition.startDate || new Date().toISOString(),
                    endDate: competition.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: competition.status || 'active',
                    questions: competition.questions || [],
                    createdAt: new Date().toISOString()
                };

                this._log(`Preparing to add competition: ${JSON.stringify(completeCompetition)}`);

                const request = store.add(completeCompetition);

                request.onsuccess = (event) => {
                    const competitionId = event.target.result;
                    this._log(`Competition added successfully. Generated ID: ${competitionId}`);
                    
                    // Immediate and comprehensive backup
                    this.backupToLocalStorage();
                    
                    resolve(competitionId);
                };

                request.onerror = (event) => {
                    this._log(`Detailed error adding competition: ${event.target.error}`, 'error');
                    reject(event.target.error);
                };
            } catch (error) {
                this._log(`Comprehensive error in addCompetition: ${error}`, 'error');
                reject(error);
            }
        });
    }

    // Enhanced Get Competitions Method
    async getCompetitions(filters = {}) {
        if (!this.isInitialized) {
            this._log('Database not initialized. Initializing first.', 'warn');
            await this.initDatabase();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['competitions'], 'readonly');
                const store = transaction.objectStore('competitions');
                const request = store.getAll();

                request.onsuccess = (event) => {
                    let competitions = event.target.result || [];
                    
                    this._log(`Retrieved ${competitions.length} competitions`);

                    // Apply filters
                    if (filters.status) {
                        competitions = competitions.filter(comp => comp.status === filters.status);
                    }

                    // Sort by creation date, newest first
                    competitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    resolve(competitions);
                };

                request.onerror = (event) => {
                    this._log(`Error retrieving competitions: ${event.target.error}`, 'error');
                    reject(event.target.error);
                };
            } catch (error) {
                this._log(`Unexpected error in getCompetitions: ${error}`, 'error');
                reject(error);
            }
        });
    }

    // Competitions Methods with Enhanced Error Handling
    async getCompetitionById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['competitions'], 'readonly');
            const store = transaction.objectStore('competitions');
            const request = store.get(id);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('❌ خطأ في جلب المسابقة:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Method to update an existing competition
    async updateCompetition(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['competitions'], 'readwrite');
            const store = transaction.objectStore('competitions');
            
            const getRequest = store.get(id);

            getRequest.onsuccess = (event) => {
                const competition = event.target.result;
                
                if (!competition) {
                    reject(new Error('المسابقة غير موجودة'));
                    return;
                }

                const updatedCompetition = { ...competition, ...updates };
                const putRequest = store.put(updatedCompetition);

                putRequest.onsuccess = () => {
                    console.log('✅ تم تحديث المسابقة');
                    resolve(updatedCompetition);
                };

                putRequest.onerror = (putEvent) => {
                    console.error('❌ خطأ في تحديث المسابقة:', putEvent.target.error);
                    reject(putEvent.target.error);
                };
            };

            getRequest.onerror = (event) => {
                console.error('❌ خطأ في استرجاع المسابقة:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Participants Methods
    async registerParticipant(participant) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['participants'], 'readwrite');
            const store = transaction.objectStore('participants');
            const mobileIndex = store.index('mobile');

            // Check if participant already exists
            const checkRequest = mobileIndex.get(participant.mobile);

            checkRequest.onsuccess = (event) => {
                if (event.target.result) {
                    console.log('❌ المشارك مسجل بالفعل');
                    reject(new Error('المشارك مسجل بالفعل'));
                    return;
                }

                // If not exists, add new participant
                const addRequest = store.add({
                    ...participant,
                    registeredAt: new Date().toISOString()
                });

                addRequest.onsuccess = (addEvent) => {
                    console.log('✅ تم تسجيل المشارك:', addEvent.target.result);
                    resolve(addEvent.target.result);
                };

                addRequest.onerror = (addEvent) => {
                    console.error('❌ خطأ في تسجيل المشارك:', addEvent.target.error);
                    reject(addEvent.target.error);
                };
            };

            checkRequest.onerror = (event) => {
                console.error('❌ خطأ في التحقق من المشارك:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getParticipants(competitionId = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['participants'], 'readonly');
            const store = transaction.objectStore('participants');
            
            let request;
            if (competitionId) {
                const competitionIndex = store.index('competitionId');
                request = competitionIndex.getAll(competitionId);
            } else {
                request = store.getAll();
            }

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('❌ خطأ في جلب المشاركين:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Questions Methods
    async addQuestion(competitionId, question) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions'], 'readwrite');
            const store = transaction.objectStore('questions');
            
            const request = store.add({
                ...question,
                competitionId,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = (event) => {
                console.log('✅ تمت إضافة السؤال:', event.target.result);
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('❌ خطأ في إضافة السؤال:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getQuestions(competitionId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions'], 'readonly');
            const store = transaction.objectStore('questions');
            const competitionIndex = store.index('competitionId');

            const request = competitionIndex.getAll(competitionId);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('❌ خطأ في جلب الأسئلة:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Responses Methods
    async saveResponse(participantId, questionId, response) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['responses'], 'readwrite');
            const store = transaction.objectStore('responses');
            
            const request = store.add({
                participantId,
                questionId,
                response,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = (event) => {
                console.log('✅ تمت حفظ الإجابة:', event.target.result);
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('❌ خطأ في حفظ الإجابة:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getResponses(participantId = null, questionId = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['responses'], 'readonly');
            const store = transaction.objectStore('responses');
            
            let request;
            if (participantId) {
                const participantIndex = store.index('participantId');
                request = participantIndex.getAll(participantId);
            } else if (questionId) {
                const questionIndex = store.index('questionId');
                request = questionIndex.getAll(questionId);
            } else {
                request = store.getAll();
            }

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('❌ خطأ في جلب الإجابات:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Leaderboard Calculation
    async calculateLeaderboard(competitionId) {
        return new Promise(async (resolve, reject) => {
            try {
                const participants = await this.getParticipants(competitionId);
                const questions = await this.getQuestions(competitionId);
                const responses = await this.getResponses();

                const leaderboard = participants.map(participant => {
                    const participantResponses = responses.filter(r => r.participantId === participant.id);
                    
                    const totalScore = participantResponses.reduce((score, response) => {
                        const question = questions.find(q => q.id === response.questionId);
                        
                        // Score calculation logic
                        if (question) {
                            if (question.type === 'trueOrFalse') {
                                return response.response === question.answer ? 
                                    score + question.points : score;
                            } else if (question.type === 'multipleChoice') {
                                return response.response === question.correctChoice ? 
                                    score + question.points : score;
                            }
                        }
                        
                        return score;
                    }, 0);

                    return {
                        name: participant.name,
                        totalScore
                    };
                });

                // Sort leaderboard by score
                resolve(leaderboard.sort((a, b) => b.totalScore - a.totalScore));
            } catch (error) {
                console.error('❌ خطأ في حساب لوحة المتصدرين:', error);
                reject(error);
            }
        });
    }

    // Debugging Method to Clear Database
    async clearAllData() {
        this._log('Attempting to clear all database data', 'warn');
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.dbName);
            
            request.onsuccess = () => {
                this._log('Database deleted successfully');
                this.isInitialized = false;
                this.initializationPromise = null;
                resolve();
            };

            request.onerror = (event) => {
                this._log(`Error deleting database: ${event.target.error}`, 'error');
                reject(event.target.error);
            };
        });
    }

    // Debugging and Diagnostic Methods
    async debugDatabaseState() {
        try {
            const competitions = await this.getCompetitions();
            console.group('🔍 Database Diagnostic Report');
            console.log('Total Competitions:', competitions.length);
            console.log('Competitions Details:', competitions);
            console.log('Diagnostic Logs:', this.diagnosticLogs);
            console.groupEnd();
        } catch (error) {
            console.error('Error in database state diagnostic:', error);
        }
    }
}

// Global Database Instance
const competitionDB = new CompetitionDatabase();

// Persistent Initialization with Comprehensive Error Handling
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.group('🗄️ Competition Database Comprehensive Initialization');
        await competitionDB.initDatabase();
        
        // Optional: Add a global debug method
        window.debugCompetitionDatabase = () => {
            competitionDB.debugDatabaseState();
            competitionDB.exportDiagnosticLogs();
        };

        window.forceRestoreFromBackup = async () => {
            console.log('Forcing restore from backup...');
            await competitionDB.restoreFromLocalStorage();
        };

        console.groupEnd();
    } catch (error) {
        console.group('❌ Database Initialization Critical Error');
        console.error('Comprehensive database initialization failed:', error);
        console.groupEnd();
        alert('حدث خطأ خطير في إعداد قاعدة البيانات. يرجى التحقق من وحدة التخزين.');
    }
});
