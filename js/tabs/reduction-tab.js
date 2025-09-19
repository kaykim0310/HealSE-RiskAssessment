import { BaseTab } from './base-tab.js';

export class ReductionTab extends BaseTab {
    constructor(dataManager) {
        super(dataManager);
        this.tabName = 'reduction';
    }
    
    render() {
        // 오늘 날짜 설정
        const reductionDate = this.getElement('reductionDate');
        if (reductionDate && !reductionDate.value) {
            reductionDate.valueAsDate = new Date();
        }
        
        // 테이블 로드
        this.loadReductionTable();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    save() {
        const processName = this.getValue('reductionProcessName');
        const executionDept = this.getValue('executionDept');
        const date = this.getValue('reductionDate');
        
        // 테이블 데이터 수집
        const reductions = this.collectTableData();
        
        // 데이터 저장
        this.dataManager.setData('reduction', {
            processName,
            executionDept,
            date,
            items: reductions
        });
    }
    
    loadReductionTable() {
        const tbody = this.getElement('reductionTableBody');
        if (!tbody) return;
        
        const savedData = this.dataManager.getData().reduction;
        
        if (savedData?.items && savedData.items.length > 0) {
            tbody.innerHTML = '';
            savedData.items.forEach(item => {
                this.createReductionRow(item);
            });
        } else if (tbody.children.length === 0) {
            // 빈 행 하나 추가
            this.addReductionRow();
        }
    }
    
    createReductionRow(data = {}) {
        const tbody = this.getElement('reductionTableBody');
        if (!tbody) return;
        
        const rowNumber = tbody.children.length + 1;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <input type="text" value="${rowNumber}" readonly style="text-align: center; width: 100%; background: #f7fafc;">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <input type="text" placeholder="재해형태 입력" value="${data.hazardType || ''}">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <textarea placeholder="감소대책을 구체적으로 작성" rows="3" style="width: 100%;">${data.reductionPlan || ''}</textarea>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <input type="text" placeholder="조치결과" value="${data.actionResult || ''}">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <input type="date" value="${data.schedule || ''}">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <input type="date" value="${data.confirmDate || ''}">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <input type="text" placeholder="비용/진원" value="${data.costResource || ''}">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <button class="btn btn-secondary delete-btn" style="padding: 5px 10px; background: #e53e3e; color: white;">삭제</button>
            </td>
        `;
        
        // 삭제 버튼 이벤트
        row.querySelector('.delete-btn').addEventListener('click', () => {
            if (tbody.children.length > 1) {
                row.remove();
                this.updateRowNumbers();
            } else {
                window.app.notificationManager.show('최소 1개의 행은 유지되어야 합니다.', 'error');
            }
        });
        
        tbody.appendChild(row);
    }
    
    addReductionRow() {
        this.createReductionRow();
    }
    
    updateRowNumbers() {
        const tbody = this.getElement('reductionTableBody');
        if (!tbody) return;
        
        Array.from(tbody.children).forEach((row, index) => {
            const numberInput = row.cells[0].querySelector('input');
            if (numberInput) {
                numberInput.value = index + 1;
            }
        });
    }
    
    collectTableData() {
        const tbody = this.getElement('reductionTableBody');
        if (!tbody) return [];
        
        const data = [];
        
        Array.from(tbody.children).forEach(row => {
            const rowData = {
                hazardType: row.cells[1].querySelector('input')?.value || '',
                reductionPlan: row.cells[2].querySelector('textarea')?.value || '',
                actionResult: row.cells[3].querySelector('input')?.value || '',
                schedule: row.cells[4].querySelector('input')?.value || '',
                confirmDate: row.cells[5].querySelector('input')?.value || '',
                costResource: row.cells[6].querySelector('input')?.value || ''
            };
            
            // 비어있지 않은 행만 저장
            if (Object.values(rowData).some(value => value.trim() !== '')) {
                data.push(rowData);
            }
        });
        
        return data;
    }
    
    setupEventListeners() {
        // 대책 추가 버튼
        const addButton = document.querySelector('[data-add-reduction]');
        if (addButton) {
            addButton.addEventListener('click', () => this.addReductionRow());
        }
    }
}