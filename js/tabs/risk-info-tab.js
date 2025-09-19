import { BaseTab } from './base-tab.js';

export class RiskInfoTab extends BaseTab {
    constructor(dataManager) {
        super(dataManager);
        this.tabName = 'riskInfo';
    }
    
    render() {
        const data = this.dataManager.getData();
        
        // 업종명
        this.setValue('industryName', data.riskInfo?.industryName);
        
        // 공정 탭 생성
        this.createProcessTabs();
        
        // 현재 공정 선택
        this.selectProcess(data.currentProcessIndex || 0);
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    save() {
        // 업종명 저장
        this.dataManager.setData('riskInfo.industryName', this.getValue('industryName'));
        
        // 현재 공정의 위험정보 저장
        const currentProcess = this.dataManager.getCurrentProcess();
        if (!currentProcess) return;
        
        const index = this.dataManager.getData().currentProcessIndex;
        
        // 원재료
        const materials = this.collectListItems('materialsList');
        this.dataManager.updateProcess(index, 'riskInfo', {
            ...currentProcess.riskInfo,
            materials
        });
        
        // 기계기구
        const equipment = this.collectListItems('equipmentList');
        this.dataManager.updateProcess(index, 'riskInfo', {
            ...currentProcess.riskInfo,
            equipment
        });
        
        // 화학물질
        const chemicals = this.collectListItems('chemicalsList');
        this.dataManager.updateProcess(index, 'riskInfo', {
            ...currentProcess.riskInfo,
            chemicals
        });
    }
    
    createProcessTabs() {
        const container = this.getElement('processSelectTabs');
        if (!container) return;
        
        container.innerHTML = '';
        const processes = this.dataManager.getData().processes;
        
        processes.forEach((process, index) => {
            const tab = this.createElement('button', {
                className: 'process-tab',
                textContent: process.name || `공정 ${index + 1}`,
                style: {
                    padding: '10px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    color: '#4a5568'
                },
                events: {
                    click: () => this.selectProcess(index)
                }
            });
            
            container.appendChild(tab);
        });
    }
    
    selectProcess(index) {
        this.dataManager.setData('currentProcessIndex', index);
        
        // 탭 스타일 업데이트
        const tabs = document.querySelectorAll('#processSelectTabs button');
        tabs.forEach((tab, i) => {
            if (i === index) {
                tab.style.background = 'linear-gradient(135deg, #e6d7c3, #d4c4a8)';
                tab.style.color = '#2d3748';
                tab.style.borderColor = 'transparent';
            } else {
                tab.style.background = 'white';
                tab.style.color = '#4a5568';
                tab.style.borderColor = '#e2e8f0';
            }
        });
        
        // 공정명 표시
        const process = this.dataManager.getProcess(index);
        this.setValue('currentProcessName', process?.name || `공정 ${index + 1}`);
        
        // 위험정보 로드
        this.loadRiskInfo(process);
    }
    
    loadRiskInfo(process) {
        if (!process) return;
        
        const riskInfo = process.riskInfo || {};
        
        // 원재료
        this.loadList('materialsList', riskInfo.materials || [], 'addMaterial');
        
        // 기계기구
        this.loadList('equipmentList', riskInfo.equipment || process.equipment || [], 'addEquipment');
        
        // 화학물질
        this.loadList('chemicalsList', riskInfo.chemicals || process.chemicals || [], 'addChemical');
    }
    
    loadList(containerId, items, addFunction) {
        const container = this.getElement(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (items.length > 0) {
            items.forEach(item => {
                this.createListItem(containerId, item);
            });
        }
    }
    
    createListItem(containerId, value = '') {
        const container = this.getElement(containerId);
        if (!container) return;
        
        const itemDiv = this.createElement('div', {
            style: {
                display: 'flex',
                gap: '10px',
                marginBottom: '10px'
            },
            innerHTML: `
                <input type="text" value="${value}" placeholder="항목 입력" style="flex: 1;">
                <button class="btn btn-secondary" style="padding: 8px 15px; background: #e53e3e; color: white;">삭제</button>
            `
        });
        
        // 삭제 버튼 이벤트
        itemDiv.querySelector('button').addEventListener('click', () => {
            itemDiv.remove();
        });
        
        container.appendChild(itemDiv);
    }
    
    collectListItems(containerId) {
        const container = this.getElement(containerId);
        if (!container) return [];
        
        const items = [];
        container.querySelectorAll('input[type="text"]').forEach(input => {
            if (input.value.trim()) {
                items.push(input.value.trim());
            }
        });
        
        return items;
    }
    
    setupEventListeners() {
        // 원재료 추가 버튼
        const materialButton = document.querySelector('button[onclick="addMaterial()"]');
        if (materialButton) {
            materialButton.onclick = () => this.createListItem('materialsList');
        }
        
        // 기계기구 추가 버튼
        const equipmentButton = document.querySelector('button[onclick="addEquipment()"]');
        if (equipmentButton) {
            equipmentButton.onclick = () => this.createListItem('equipmentList');
        }
        
        // 화학물질 추가 버튼
        const chemicalButton = document.querySelector('button[onclick="addChemical()"]');
        if (chemicalButton) {
            chemicalButton.onclick = () => this.createListItem('chemicalsList');
        }
    }
}

// window 객체에 함수 등록 (HTML에서 호출하기 위해)
window.addMaterial = () => {
    if (window.app && window.app.tabs && window.app.tabs.riskInfo) {
        window.app.tabs.riskInfo.createListItem('materialsList');
    }
};

window.addEquipment = () => {
    if (window.app && window.app.tabs && window.app.tabs.riskInfo) {
        window.app.tabs.riskInfo.createListItem('equipmentList');
    }
};

window.addChemical = () => {
    if (window.app && window.app.tabs && window.app.tabs.riskInfo) {
        window.app.tabs.riskInfo.createListItem('chemicalsList');
    }
};