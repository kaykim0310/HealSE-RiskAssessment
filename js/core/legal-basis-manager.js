export class LegalBasisManager {
    constructor() {
        this.legalBasisData = [];
        this.legalBasisMapping = {};
    }
    
    async loadFromExcel(file) {
        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            if (workbook.SheetNames.length === 0) {
                throw new Error('엑셀 파일에 시트가 없습니다.');
            }
            
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (!jsonData || jsonData.length === 0) {
                throw new Error('엑셀 파일에 데이터가 없습니다.');
            }
            
            // 데이터 처리
            this.processExcelData(jsonData);
            
            // 로컬 스토리지에 저장
            this.saveToStorage();
            
            return true;
        } catch (error) {
            console.error('엑셀 파일 처리 오류:', error);
            throw error;
        }
    }
    
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    processExcelData(jsonData) {
        // 초기화
        this.legalBasisData = [];
        this.legalBasisMapping = {};
        
        // 헤더 확인 (첫 번째 행)
        const headers = jsonData[0];
        console.log('엑셀 헤더:', headers);
        
        // 데이터 처리 (두 번째 행부터)
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length >= 3) {
                const majorCategory = row[0] ? row[0].toString().trim() : '';
                const minorCategory = row[1] ? row[1].toString().trim() : '';
                const legalText = row[2] ? row[2].toString().trim() : '';
                
                if (legalText) {
                    // 법규 데이터 추가
                    if (!this.legalBasisData.includes(legalText)) {
                        this.legalBasisData.push(legalText);
                    }
                    
                    // 매핑 데이터 생성
                    const key = `${majorCategory}|${minorCategory}`;
                    if (!this.legalBasisMapping[key]) {
                        this.legalBasisMapping[key] = [];
                    }
                    
                    if (!this.legalBasisMapping[key].includes(legalText)) {
                        this.legalBasisMapping[key].push(legalText);
                    }
                }
            }
        }
        
        console.log(`총 ${this.legalBasisData.length}개의 법규 로드 완료`);
        console.log(`매핑 생성 완료: ${Object.keys(this.legalBasisMapping).length}개`);
    }
    
    saveToStorage() {
        const dataToSave = {
            legalBasisData: this.legalBasisData,
            legalBasisMapping: this.legalBasisMapping,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('legalBasisData', JSON.stringify(dataToSave));
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('legalBasisData');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.legalBasisData = parsed.legalBasisData || [];
                this.legalBasisMapping = parsed.legalBasisMapping || {};
                return true;
            }
        } catch (error) {
            console.error('법규 데이터 로드 실패:', error);
        }
        return false;
    }
    
    getRecommendedLaws(classification, hazard) {
        const key = `${classification}|${hazard}`;
        return this.legalBasisMapping[key] || [];
    }
    
    getAllLaws() {
        return this.legalBasisData;
    }
    
    isDataLoaded() {
        return this.legalBasisData.length > 0;
    }
}