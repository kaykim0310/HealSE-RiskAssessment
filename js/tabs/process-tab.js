import { BaseTab } from './base-tab.js';

export class ProcessTab extends BaseTab {
    constructor(dataManager) {
        super(dataManager);
        this.tabName = 'process';
    }
    
    render() {
        const data = this.dataManager.getData();
        
        // 사업장 정보
        this.setValue('workplaceName', data.company?.name);
        this.setValue('ceoName', data.workplace?.ceo);
        this.setValue('mainProducts', data.workplace?.products);
        this.setValue('employeeCount', data.workplace?.employees);
        this.setValue('evalDate', data.workplace?.evalDate || this.getTodayDate());
        this.setValue('evaluatorName', data.workplace?.evaluator);
        
        // 공정 표시
        this.renderProcesses();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    save() {
        // 사업장 정보 저장
        this.dataManager.setData('workplace.ceo', this.getValue('ceoName'));
        this.dataManager.setData('workplace.products', this.getValue('mainProducts'));
        this.dataManager.setData('workplace.employees', this.getValue('employeeCount'));
        this.dataManager.setData('workplace.evalDate', this.getValue('evalDate'));
        this.dataManager.setData('workplace.evaluator', this.getValue('evaluatorName'));
    }
    
    renderProcesses() {
        const container = this.getElement('processContainer');
        if (!container) return;
        
        container.innerHTML = '';
        const processes = this.dataManager.getData().processes;
        
        if (processes.length === 0) {
            // 기본 공정 3개 추가
            for (let i = 0; i < 3; i++) {
                this.addProcess();
            }
        } else {
            processes.forEach((process, index) => {
                this.createProcessElement(process, index);
            });
        }
    }
    
    addProcess() {
        const index = this.dataManager.addProcess();
        const process = this.dataManager.getProcess(index);
        this.createProcessElement(process, index);
    }
    
    createProcessElement(process, index) {
        const container = this.getElement('processContainer');
        if (!container) return;
        
        const processDiv = this.createElement('div', {
            style: {
                marginBottom: '30px',
                padding: '20px',
                background: '#f7fafc',
                borderRadius: '10px'
            },
            innerHTML: `
                <h3 style="color: #4a5568; margin-bottom: 15px;">공정 ${index + 1}</h3>
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.9rem; color: #718096; margin-bottom: 5px;">공정명</label>
                        <input type="text" id="processName${index}" placeholder="공정명 입력" value="${process.name || ''}">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.9rem; color: #718096; margin-bottom: 5px;">공정설명</label>
                        <textarea id="processDesc${index}" rows="3" placeholder="공정 설명 입력">${process.description || ''}</textarea>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.9rem; color: #718096; margin-bottom: 5px;">주요기계기구 (쉼표로 구분)</label>
                        <input type="text" id="processEquip${index}" placeholder="예: 지게차, 컨베이어" value="${process.equipment?.join(', ') || ''}">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.9rem; color: #718096; margin-bottom: 5px;">유해위험물질 (쉼표로 구분)</label>
                        <input type="text" id="processChem${index}" placeholder="예: 윤활유, 세척제" value="${process.chemicals?.join(', ') || ''}">
                    </div>
                </div>
            `
        });
        
        // 이벤트 리스너 추가
        processDiv.querySelector(`#processName${index}`).addEventListener('change', (e) => {
            this.dataManager.updateProcess(index, 'name', e.target.value);
        });
        
        processDiv.querySelector(`#processDesc${index}`).addEventListener('change', (e) => {
            this.dataManager.updateProcess(index, 'description', e.target.value);
        });
        
        processDiv.querySelector(`#processEquip${index}`).addEventListener('change', (e) => {
            const equipment = e.target.value.split(',').map(item => item.trim()).filter(item => item);
            this.dataManager.updateProcess(index, 'equipment', equipment);
        });
        
        processDiv.querySelector(`#processChem${index}`).addEventListener('change', (e) => {
            const chemicals = e.target.value.split(',').map(item => item.trim()).filter(item => item);
            this.dataManager.updateProcess(index, 'chemicals', chemicals);
        });
        
        container.appendChild(processDiv);
    }
    
    setupEventListeners() {
        // 공정 추가 버튼
        const addButton = document.querySelector('button[onclick="addProcess()"]');
        if (addButton) {
            addButton.onclick = () => this.addProcess();
        }
    }
    
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }
}