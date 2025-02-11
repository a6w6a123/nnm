// Advanced IndexedDB Database Management
class CompetitionDatabase {
    constructor() {
        this.dbName = 'CompetitionPlatform';
        this.dbVersion = 2; // Increment version to force schema update
        this.db = null;
    }

    // Initialize IndexedDB with robust error handling
    initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('competitions')) {
                    const competitionStore = db.createObjectStore('competitions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Create indexes for better querying
                    competitionStore.createIndex('title', 'title', { unique: false });
                    competitionStore.createIndex('status', 'status', { unique: false });
                    competitionStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Database initialized successfully');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('❌ Database initialization error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Add a new competition with comprehensive validation
    addCompetition(competition) {
        return new Promise((resolve, reject) => {
            if (!this.validateCompetition(competition)) {
                reject(new Error('بيانات المسابقة غير صالحة'));
                return;
            }

            if (!this.db) {
                this.initDatabase()
                    .then(() => this._addCompetition(competition, resolve, reject))
                    .catch(reject);
                return;
            }

            this._addCompetition(competition, resolve, reject);
        });
    }

    // Internal method to add competition
    _addCompetition(competition, resolve, reject) {
        const transaction = this.db.transaction(['competitions'], 'readwrite');
        const store = transaction.objectStore('competitions');

        const fullCompetition = {
            ...competition,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const request = store.add(fullCompetition);

        request.onsuccess = (event) => {
            console.log('✅ Competition added successfully:', event.target.result);
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('❌ Error adding competition:', event.target.error);
            reject(event.target.error);
        };
    }

    // Validate competition data
    validateCompetition(competition) {
        return !!(
            competition.title && 
            competition.title.trim() !== '' &&
            competition.startDate &&
            competition.endDate &&
            competition.status
        );
    }

    // Get all competitions with sorting
    getCompetitions() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                this.initDatabase()
                    .then(() => this._getCompetitions(resolve, reject))
                    .catch(reject);
                return;
            }
            this._getCompetitions(resolve, reject);
        });
    }

    // Internal method to retrieve competitions
    _getCompetitions(resolve, reject) {
        const transaction = this.db.transaction(['competitions'], 'readonly');
        const store = transaction.objectStore('competitions');
        const request = store.getAll();

        request.onsuccess = (event) => {
            const competitions = event.target.result || [];
            
            // Sort competitions by creation date (newest first)
            competitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('✅ Retrieved competitions:', competitions);
            resolve(competitions);
        };

        request.onerror = (event) => {
            console.error('❌ Error retrieving competitions:', event.target.error);
            reject(event.target.error);
        };
    }

    // Clear all competitions
    clearAllData() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                this.initDatabase()
                    .then(() => this._clearData(resolve, reject))
                    .catch(reject);
                return;
            }
            this._clearData(resolve, reject);
        });
    }

    // Internal method to clear data
    _clearData(resolve, reject) {
        const transaction = this.db.transaction(['competitions'], 'readwrite');
        const store = transaction.objectStore('competitions');
        const request = store.clear();

        request.onsuccess = () => {
            console.log('✅ All competitions cleared');
            resolve();
        };

        request.onerror = (event) => {
            console.error('❌ Error clearing competitions:', event.target.error);
            reject(event.target.error);
        };
    }

    // Delete a specific competition
    deleteCompetition(competitionId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                this.initDatabase()
                    .then(() => this._deleteCompetition(competitionId, resolve, reject))
                    .catch(reject);
                return;
            }
            this._deleteCompetition(competitionId, resolve, reject);
        });
    }

    // Internal method to delete competition
    _deleteCompetition(competitionId, resolve, reject) {
        const transaction = this.db.transaction(['competitions'], 'readwrite');
        const store = transaction.objectStore('competitions');
        const request = store.delete(competitionId);

        request.onsuccess = () => {
            console.log('✅ Competition deleted successfully');
            resolve();
        };

        request.onerror = (event) => {
            console.error('❌ Error deleting competition:', event.target.error);
            reject(event.target.error);
        };
    }
}

// Global database instance
const competitionDB = new CompetitionDatabase();

// Persistent Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.group('🗄️ Competition IndexedDB Database Initialization');
        await competitionDB.initDatabase();
        console.groupEnd();

        // Global debug methods
        window.getCompetitions = async () => {
            return await competitionDB.getCompetitions();
        };

        window.clearAllCompetitions = async () => {
            await competitionDB.clearAllData();
            console.log('All competitions cleared');
        };
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
});

// Export for use in other files
window.CompetitionDatabase = CompetitionDatabase;
