export class DataManager {
    constructor() {
        this.data = {
            company: {},
            workplace: {},
            processes: [],
            currentProcessIndex: 0,
            riskInfo: {},
            improvement: {}
        };
        
        this.loadData();
    }
    
    getData() {
        return this.data;
    }
    
    setData(key, value) {
        if (key.includes('.')) {
            // 중첩된 객체 처리
            const keys = key.split('.');
            let current = this.data;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
        } else {
            this.data[key] = value;
        }
        
        this.saveData();
    }
    
    getProcess(index) {
        return this.data.processes[index] || null;
    }
    
    getCurrentProcess() {
        return this.getProcess(this.data.currentProcessIndex);
    }
    
    addProcess() {
        const newProcess = {
            name: '',
            description: '',
            equipment: [],
            chemicals: [],
            riskInfo: {
                materials: [],
                equipment: [],
                chemicals: []
            },
            hazardClassification: {},
            assessments: []
        };
        
        this.data.processes.push(newProcess);
        this.saveData();
        return this.data.processes.length - 1;
    }
    
    updateProcess(index, field, value) {
        if (this.data.processes[index]) {
            this.data.processes[index][field] = value;
            this.saveData();
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('riskAssessmentData', JSON.stringify({
                data: this.data,
                timestamp: new Date().toISOString(),
                version: '2.0'
            }));
        } catch (error) {
            console.error('데이터 저장 실패:', error);
        }
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('riskAssessmentData');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.data) {
                    this.data = parsed.data;
                    return true;
                }
            }
        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
        return false;
    }
    
    clearData() {
        this.data = {
            company: {},
            workplace: {},
            processes: [],
            currentProcessIndex: 0,
            riskInfo: {},
            improvement: {}
        };
        
        localStorage.removeItem('riskAssessmentData');
    }
    
    exportData() {
        return {
            data: this.data,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
    }
}