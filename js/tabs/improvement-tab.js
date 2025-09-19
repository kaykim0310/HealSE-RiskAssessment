import { BaseTab } from './base-tab.js';

export class ImprovementTab extends BaseTab {
    constructor(dataManager) {
        super(dataManager);
        this.tabName = 'improvement';
    }
    
    render() {
        const data = this.dataManager.getData();
        
        // 오늘 날짜 설정
        const writeDate = this.getElement('improvementWriteDate');
        if (writeDate && !writeDate.value) {
            writeDate.valueAsDate = new Date();
        }
        
        // 개선활동 데이터 로드
        if (data.improvement) {
            this.setValue('improvementProcess', data.improvement.process);
            this.setValue('improvementHazards', data.improvement.hazards);
            this.setValue('currentPossibility', data.improvement.currentPossibility);
            this.setValue('currentSeverity', data.improvement.currentSeverity);
            this.setValue('currentRisk', data.improvement.currentRisk);
            this.setValue('improvedPossibility', data.improvement.improvedPossibility);
            this.setValue('improvedSeverity', data.improvement.improvedSeverity);
            this.setValue('improvedRisk', data.improvement.improvedRisk);
            this.setValue('improvementDetails', data.improvement.details);
        }
        
        // 개선활동 테이블 로드
        this.loadImprovementTable();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    save() {
        // 개선활동 데이터 저장
        this.dataManager.setData('improvement', {
            process: this.getValue('improvementProcess'),
            hazards: this.getValue('improvementHazards'),
            currentPossibility: this.getValue('currentPossibility'),
            currentSeverity: this.getValue('currentSeverity'),
            currentRisk: this.getValue('currentRisk'),
            improvedPossibility: this.getValue('improvedPossibility'),
            improvedSeverity: this.getValue('improvedSeverity'),
            improvedRisk: this.getValue('improvedRisk'),
            details: this.getValue('improvementDetails'),
            writeDate: this.getValue('improvementWriteDate'),
            table: this.collectTableData()
        });
    }
    
    loadImprovementTable() {
        const tbody = this.getElement('improvementTableBody');
        if (!tbody) return;
        
        const savedData = this.dataManager.getData().improvement;
        
        if (savedData?.table && savedData.table.length > 0) {
            tbody.innerHTML = '';
            savedData.table.forEach(item => {
                this.createImprovementRow(item);
            });
        } else if (tbody.children.length === 0) {
            // 빈 행 하나 추가
            this.addImprovementRow();
        }
    }
    
    createImprovementRow(data = {}) {
        const tbody = this.getElement('improvementTableBody');
        if (!tbody) return;
        
        const rowNumber = tbody.children.length + 1;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <input type="text" value="${rowNumber}" readonly style="text-align: center; width: 100%; background: #f7fafc;">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <input type="text" placeholder="위험성평가 내용" value="${data.assessment || ''}">
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <textarea placeholder="감소대책" rows="2" style="width: 100%;">${data.reductionPlan || ''}</textarea>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <select class="improvement-possibility" style="width: 100%;">
                    <option value="">선택</option>
                    <option value="5" ${data.possibility === '5' ? 'selected' : ''}>매우자주(5)</option>
                    <option value="4" ${data.possibility === '4' ? 'selected' : ''}>자주(4)</option>
                    <option value="3" ${data.possibility === '3' ? 'selected' : ''}>보통(3)</option>
                    <option value="2" ${data.possibility === '2' ? 'selected' : ''}>가끔(2)</option>
                    <option value="1" ${data.possibility === '1' ? 'selected' : ''}>매우가끔(1)</option>
                </select>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <select class="improvement-severity" style="width: 100%;">
                    <option value="">선택</option>
                    <option value="4" ${data.severity === '4' ? 'selected' : ''}>매우위험(4)</option>
                    <option value="3" ${data.severity === '3' ? 'selected' : ''}>위험(3)</option>
                    <option value="2" ${data.severity === '2' ? 'selected' : ''}>보통(2)</option>
                    <option value="1" ${data.severity === '1' ? 'selected' : ''}>양호(1)</option>
                </select>
            </td>
            <td class="improvement-risk-result" style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">
                ${data.risk || '-'}
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <button class="btn btn-secondary delete-btn" style="padding: 5px 10px; background: #e53e3e; color: white;">삭제</button>
            </td>
        `;
        
        // 이벤트 리스너
        const possibilitySelect = row.querySelector('.improvement-possibility');
        const severitySelect = row.querySelector('.improvement-severity');
        
        possibilitySelect.addEventListener('change', () => this.calculateTableRisk(row));
        severitySelect.addEventListener('change', () => this.calculateTableRisk(row));
        
        // 삭제 버튼
        row.querySelector('.delete-btn').addEventListener('click', () => {
            if (tbody.children.length > 1) {
                row.remove();
                this.updateRowNumbers();
            } else {
                window.app.notificationManager.show('최소 1개의 행은 유지되어야 합니다.', 'error');
            }
        });
        
        tbody.appendChild(row);
        
        // 기존 위험성 값이 있으면 색상 적용
        if (data.risk) {
            this.applyRiskColorToCell(row.querySelector('.improvement-risk-result'), data.risk);
        }
    }
    
    addImprovementRow() {
        this.createImprovementRow();
    }
    
    calculateRisk(currentField, improvedField, resultField) {
        const possibility = this.getElement(currentField).value;
        const severity = this.getElement(improvedField).value;
        const riskInput = this.getElement(resultField);
        
        if (possibility && severity) {
            const risk = parseInt(possibility) * parseInt(severity);
            riskInput.value = risk;
            this.applyRiskColorToInput(riskInput, risk);
        } else {
            riskInput.value = '';
            riskInput.style.background = '#f7fafc';
            riskInput.style.color = '#000';
        }
    }
    
    calculateTableRisk(row) {
        const possibility = row.querySelector('.improvement-possibility').value;
        const severity = row.querySelector('.improvement-severity').value;
        const riskCell = row.querySelector('.improvement-risk-result');
        
        if (possibility && severity) {
            const risk = parseInt(possibility) * parseInt(severity);
            riskCell.textContent = risk;
            this.applyRiskColorToCell(riskCell, risk);
        } else {
            riskCell.textContent = '-';
            riskCell.style.background = '';
            riskCell.style.color = '';
        }
    }
    
    applyRiskColorToInput(input, risk) {
        if (risk >= 12) {
            input.style.background = '#ff8787';
            input.style.color = 'white';
        } else if (risk >= 6) {
            input.style.background = '#ffd43b';
            input.style.color = '#000';
        } else {
            input.style.background = '#51cf66';
            input.style.color = '#000';
        }
        input.style.fontWeight = '600';
    }
    
    applyRiskColorToCell(cell, risk) {
        if (risk >= 12) {
            cell.style.background = '#ff8787';
            cell.style.color = 'white';
        } else if (risk >= 6) {
            cell.style.background = '#ffd43b';
            cell.style.color = '#000';
        } else {
            cell.style.background = '#51cf66';
            cell.style.color = '#000';
        }
    }
    
    updateRowNumbers() {
        const tbody = this.getElement('improvementTableBody');
        if (!tbody) return;
        
        Array.from(tbody.children).forEach((row, index) => {
            const numberInput = row.cells[0].querySelector('input');
            if (numberInput) {
                numberInput.value = index + 1;
            }
        });
    }
    
    collectTableData() {
        const tbody = this.getElement('improvementTableBody');
        if (!tbody) return [];
        
        const data = [];
        
        Array.from(tbody.children).forEach(row => {
            const rowData = {
                assessment: row.cells[1].querySelector('input')?.value || '',
                reductionPlan: row.cells[2].querySelector('textarea')?.value || '',
                possibility: row.cells[3].querySelector('select')?.value || '',
                severity: row.cells[4].querySelector('select')?.value || '',
                risk: row.cells[5].textContent === '-' ? '' : row.cells[5].textContent
            };
            
            // 비어있지 않은 행만 저장
            if (Object.values(rowData).some(value => value !== '')) {
                data.push(rowData);
            }
        });
        
        return data;
    }
    
    setupEventListeners() {
        // 현재 위험성 계산
        const currentPossibility = this.getElement('currentPossibility');
        const currentSeverity = this.getElement('currentSeverity');
        
        if (currentPossibility && currentSeverity) {
            currentPossibility.addEventListener('change', () => 
                this.calculateRisk('currentPossibility', 'currentSeverity', 'currentRisk')
            );
            currentSeverity.addEventListener('change', () => 
                this.calculateRisk('currentPossibility', 'currentSeverity', 'currentRisk')
            );
        }
        
        // 개선 후 위험성 계산
        const improvedPossibility = this.getElement('improvedPossibility');
        const improvedSeverity = this.getElement('improvedSeverity');
        
        if (improvedPossibility && improvedSeverity) {
            improvedPossibility.addEventListener('change', () => 
                this.calculateRisk('improvedPossibility', 'improvedSeverity', 'improvedRisk')
            );
            improvedSeverity.addEventListener('change', () => 
                this.calculateRisk('improvedPossibility', 'improvedSeverity', 'improvedRisk')
            );
        }
        
        // 항목 추가 버튼
        const addButton = document.querySelector('button[onclick="addImprovementRow()"]');
        if (addButton) {
            addButton.onclick = () => this.addImprovementRow();
        }
        
        // 엑셀 리포트 생성 버튼
        const excelButton = document.querySelector('[data-generate-excel]');
        if (excelButton) {
            excelButton.addEventListener('click', async () => {
                try {
                    const data = this.dataManager.exportData();
                    await window.app.exportManager.generateExcelReport(data.data);
                    window.app.notificationManager.show('엑셀 리포트가 생성되었습니다!', 'success');
                } catch (error) {
                    console.error('엑셀 생성 오류:', error);
                    window.app.notificationManager.show('엑셀 생성 중 오류가 발생했습니다.', 'error');
                }
            });
        }
        
        // PDF 리포트 생성 버튼
        const pdfButton = document.querySelector('[data-generate-pdf]');
        if (pdfButton) {
            pdfButton.addEventListener('click', async () => {
                try {
                    const data = this.dataManager.exportData();
                    await window.app.exportManager.generatePDFReport(data.data);
                    window.app.notificationManager.show('PDF 리포트가 생성되었습니다!', 'success');
                } catch (error) {
                    console.error('PDF 생성 오류:', error);
                    window.app.notificationManager.show('PDF 생성 중 오류가 발생했습니다.', 'error');
                }
            });
        }
    }
}

// window 객체에 함수 등록
window.addImprovementRow = () => {
    if (window.app && window.app.tabs && window.app.tabs.improvement) {
        window.app.tabs.improvement.addImprovementRow();
    }
};