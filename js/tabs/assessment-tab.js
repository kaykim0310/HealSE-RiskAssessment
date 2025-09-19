import { BaseTab } from './base-tab.js';

export class AssessmentTab extends BaseTab {
    constructor(dataManager, legalBasisManager) {
        super(dataManager);
        this.legalBasisManager = legalBasisManager;
        this.tabName = 'assessment';
        this.currentAssessmentRow = null;
    }
    
    render() {
        const data = this.dataManager.getData();
        
        // 법규 데이터 확인
        if (!this.legalBasisManager.isDataLoaded()) {
            this.showLegalDataUpload();
        }
        
        // 공정 탭 생성
        this.createProcessTabs();
        
        // 현재 공정 선택
        this.selectProcess(data.currentProcessIndex || 0);
        
        // 오늘 날짜 설정
        const assessmentDate = this.getElement('assessmentDate');
        if (assessmentDate && !assessmentDate.value) {
            assessmentDate.valueAsDate = new Date();
        }
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    save() {
        const tbody = this.getElement('assessmentTableBody');
        if (!tbody) return;
        
        const assessments = [];
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const assessment = this.collectRowData(row);
            if (assessment) {
                assessments.push(assessment);
            }
        });
        
        // 현재 공정에 저장
        const currentIndex = this.dataManager.getData().currentProcessIndex;
        this.dataManager.updateProcess(currentIndex, 'assessments', assessments);
    }
    
    showLegalDataUpload() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            max-width: 500px;
            text-align: center;
        `;
        
        container.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #4a5568;">법규 데이터 업로드</h3>
            <p style="color: #718096; margin-bottom: 30px;">
                위험성평가를 위한 법규 데이터를 업로드해주세요.<br>
                엑셀 파일 형식: 대분류 | 중분류 | 법규
            </p>
            <div class="file-upload-area" style="
                border: 3px dashed #cbd5e0;
                border-radius: 15px;
                padding: 40px;
                margin-bottom: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                <p style="color: #4a5568; margin: 0;">
                    <strong>클릭하여 파일 선택</strong><br>
                    또는 파일을 여기로 드래그하세요
                </p>
            </div>
            <button class="btn btn-secondary" onclick="this.parentElement.remove()">나중에 하기</button>
        `;
        
        const uploadArea = container.querySelector('.file-upload-area');
        
        // 클릭 이벤트
        uploadArea.addEventListener('click', () => {
            const input = document.getElementById('legalFileInput');
            if (input) input.click();
        });
        
        // 드래그 앤 드롭
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
            uploadArea.style.background = '#edf2f7';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.style.background = 'white';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                window.app.handleLegalFileUpload(file);
                container.remove();
            }
        });
        
        document.body.appendChild(container);
    }
    
    createProcessTabs() {
        const container = this.getElement('assessmentProcessTabs');
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
        const tabs = document.querySelectorAll('#assessmentProcessTabs button');
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
        this.setValue('assessmentProcessName', process?.name || `공정 ${index + 1}`);
        
        // 평가자 자동 입력
        const evaluatorInput = this.getElement('assessmentEvaluator');
        const workplace = this.dataManager.getData().workplace;
        if (evaluatorInput && !evaluatorInput.value && workplace?.evaluator) {
            evaluatorInput.value = workplace.evaluator;
        }
        
        // 평가 테이블 로드
        this.loadAssessmentTable(process);
    }
    
    loadAssessmentTable(process) {
        const tbody = this.getElement('assessmentTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (process?.assessments && process.assessments.length > 0) {
            // 기존 평가 데이터 로드
            process.assessments.forEach((assessment, index) => {
                this.createAssessmentRow(assessment, index + 1);
            });
        } else {
            // 유해위험요인분류에서 선택된 항목들로 자동 생성
            if (process?.hazardClassification) {
                let rowNumber = 1;
                Object.keys(process.hazardClassification).forEach(category => {
                    const hazards = process.hazardClassification[category];
                    hazards.forEach(hazard => {
                        this.createAssessmentRow({
                            workContent: '',
                            classification: this.getCategoryKoreanName(category),
                            hazard: hazard,
                            cause: '',
                            legalBasis: [],
                            currentState: '',
                            possibility: '',
                            severity: '',
                            risk: '',
                            measures: '',
                            improvedRisk: '',
                            improvementDate: '',
                            completionDate: '',
                            manager: '',
                            note: ''
                        }, rowNumber++);
                    });
                });
            }
            
            // 항목이 없으면 빈 행 하나 추가
            if (tbody.children.length === 0) {
                this.addAssessmentRow();
            }
        }
    }
    
    createAssessmentRow(data = {}, rowNumber = null) {
        const tbody = this.getElement('assessmentTableBody');
        if (!tbody) return;
        
        if (!rowNumber) {
            rowNumber = tbody.children.length + 1;
        }
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; vertical-align: top; min-width: 120px;">
                <textarea placeholder="작업내용 입력" style="width: 100%; min-height: 80px; resize: vertical; font-size: 0.9rem; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px;">${data.workContent || ''}</textarea>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 100px;">
                <input type="text" value="${data.classification || ''}" readonly style="width: 100%; background: #f7fafc; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem;">
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 150px;">
                <textarea placeholder="원인을 상세히 입력하세요" style="width: 100%; min-height: 80px; resize: vertical; font-size: 0.9rem; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px;">${data.cause || ''}</textarea>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 200px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <textarea placeholder="유해 위험 요인을 상세히 입력하세요" readonly style="width: 100%; min-height: 60px; resize: vertical; font-size: 0.9rem; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px; background: #f7fafc;">${data.hazard || ''}</textarea>
                    <div style="display: flex; gap: 3px;">
                        <button class="btn btn-secondary" style="flex: 1; padding: 4px; font-size: 0.8rem; background: #4299e1; color: white; border: none; border-radius: 3px; cursor: pointer;">📋 복사</button>
                        <button class="btn btn-secondary" style="flex: 1; padding: 4px; font-size: 0.8rem; background: #e53e3e; color: white; border: none; border-radius: 3px; cursor: pointer;">🗑️ 삭제</button>
                    </div>
                </div>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 180px;">
                <div class="legal-basis-display" style="
                    min-height: 80px;
                    cursor: pointer;
                    padding: 8px;
                    background: #f7fafc;
                    border: 2px dashed #cbd5e0;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    font-size: 0.85rem;
                ">
                    ${data.legalBasis && data.legalBasis.length > 0 ? 
                        data.legalBasis.map(item => `<div style="font-size: 0.8rem; margin: 3px 0; padding: 3px 6px; background: white; border-radius: 4px; border-left: 3px solid #667eea; word-break: break-word;">${item}</div>`).join('') : 
                        '<span style="color: #a0aec0; display: flex; align-items: center; justify-content: center; height: 60px; text-align: center;">📋 클릭하여<br>법규 선택</span>'}
                </div>
                <input type="hidden" class="legal-basis-data" value='${JSON.stringify(data.legalBasis || [])}'>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 180px;">
                <textarea placeholder="현재 상태 및 조치사항을 상세히 입력하세요" style="width: 100%; min-height: 80px; resize: vertical; font-size: 0.9rem; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px;">${data.currentState || ''}</textarea>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 80px;">
                <select class="possibility-select" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem; background: white;">
                    <option value="">선택</option>
                    <option value="5" ${data.possibility === '5' ? 'selected' : ''}>매우높음(5)</option>
                    <option value="4" ${data.possibility === '4' ? 'selected' : ''}>높음(4)</option>
                    <option value="3" ${data.possibility === '3' ? 'selected' : ''}>보통(3)</option>
                    <option value="2" ${data.possibility === '2' ? 'selected' : ''}>낮음(2)</option>
                    <option value="1" ${data.possibility === '1' ? 'selected' : ''}>매우낮음(1)</option>
                </select>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 80px;">
                <select class="severity-select" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem; background: white;">
                    <option value="">선택</option>
                    <option value="4" ${data.severity === '4' ? 'selected' : ''}>매우위험(4)</option>
                    <option value="3" ${data.severity === '3' ? 'selected' : ''}>위험(3)</option>
                    <option value="2" ${data.severity === '2' ? 'selected' : ''}>보통(2)</option>
                    <option value="1" ${data.severity === '1' ? 'selected' : ''}>양호(1)</option>
                </select>
            </td>
            <td class="risk-result" style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600; vertical-align: middle; font-size: 1.2rem;">
                ${data.risk || '-'}
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 200px;">
                <textarea placeholder="감소 대책을 상세히 입력하세요" style="width: 100%; min-height: 80px; resize: vertical; font-size: 0.9rem; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px;">${data.measures || ''}</textarea>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 100px;">
                <select class="improved-risk-select" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem; background: white;">
                    <option value="">선택</option>
                    <option value="매우낮음" ${data.improvedRisk === '매우낮음' ? 'selected' : ''}>매우낮음</option>
                    <option value="낮음" ${data.improvedRisk === '낮음' ? 'selected' : ''}>낮음</option>
                    <option value="보통" ${data.improvedRisk === '보통' ? 'selected' : ''}>보통</option>
                    <option value="높음" ${data.improvedRisk === '높음' ? 'selected' : ''}>높음</option>
                </select>
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 120px;">
                <input type="date" value="${data.improvementDate || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem;">
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 120px;">
                <input type="date" value="${data.completionDate || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem;">
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 100px;">
                <input type="text" placeholder="담당자명" value="${data.manager || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.9rem;">
            </td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; min-width: 120px;">
                <textarea placeholder="비고사항" style="width: 100%; min-height: 80px; resize: vertical; font-size: 0.9rem; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px;">${data.note || ''}</textarea>
            </td>
        `;
        
        // 이벤트 리스너 추가
        this.setupRowEventListeners(row);
        
        tbody.appendChild(row);
        
        // 위험성이 이미 계산된 경우 색상 적용
        if (data.risk) {
            this.applyRiskColor(row.querySelector('.risk-result'), data.risk);
        }
    }
    
    setupRowEventListeners(row) {
        // 가능성/중대성 선택 시 위험성 계산
        const possibilitySelect = row.querySelector('.possibility-select');
        const severitySelect = row.querySelector('.severity-select');
        
        possibilitySelect.addEventListener('change', () => this.calculateRisk(row));
        severitySelect.addEventListener('change', () => this.calculateRisk(row));
        
        // 법규 선택 버튼
        const legalBasisDisplay = row.querySelector('.legal-basis-display');
        legalBasisDisplay.addEventListener('click', () => this.showLegalBasisModal(row));
        
        // 복사 버튼
        const copyBtn = row.querySelector('button');
        if (copyBtn && copyBtn.textContent.includes('복사')) {
            copyBtn.addEventListener('click', () => this.copyRow(row));
        }
        
        // 삭제 버튼
        const deleteBtn = row.querySelectorAll('button')[1];
        if (deleteBtn && deleteBtn.textContent.includes('삭제')) {
            deleteBtn.addEventListener('click', () => this.deleteRow(row));
        }
    }
    
    calculateRisk(row) {
        const possibility = row.querySelector('.possibility-select').value;
        const severity = row.querySelector('.severity-select').value;
        const riskCell = row.querySelector('.risk-result');
        
        if (possibility && severity) {
            const risk = parseInt(possibility) * parseInt(severity);
            riskCell.textContent = risk;
            this.applyRiskColor(riskCell, risk);
        } else {
            riskCell.textContent = '-';
            riskCell.style.background = '';
            riskCell.style.color = '';
        }
    }
    
    applyRiskColor(cell, risk) {
        if (risk >= 12) {
            cell.style.background = '#ff8787';
            cell.style.color = 'white';
        } else if (risk >= 6) {
            cell.style.background = '#ffd43b';
            cell.style.color = '#000';
        } else if (risk >= 1) {
            cell.style.background = '#51cf66';
            cell.style.color = '#000';
        }
    }
    
    showLegalBasisModal(row) {
        this.currentAssessmentRow = row;
        
        const modal = this.getElement('legalBasisModal');
        if (!modal) return;
        
        // 현재 행의 분류와 유해위험요인 가져오기
        const classification = row.cells[1].querySelector('input').value;
        const hazard = row.cells[3].querySelector('textarea').value;
        
        // 현재 선택된 법규
        const currentData = row.querySelector('.legal-basis-data').value;
        const selectedItems = JSON.parse(currentData || '[]');
        
        // 추천 법규 가져오기
        const recommendedLaws = this.legalBasisManager.getRecommendedLaws(classification, hazard);
        
        const content = this.getElement('legalBasisContent');
        if (!content) return;
        
        // 엑셀 데이터가 로드되었는지 확인
        if (!this.legalBasisManager.isDataLoaded()) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #718096; margin-bottom: 20px;">법규 데이터가 로드되지 않았습니다.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('legalFileInput').click()">
                        법규 엑셀 파일 업로드
                    </button>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; color: #4a5568; margin-bottom: 8px;">
                        유해위험요인: ${hazard || '미지정'}
                    </label>
                </div>
                
                ${recommendedLaws.length > 0 ? `
                    <div style="margin-bottom: 20px; padding: 15px; background: #e6fffa; border-radius: 8px; border: 1px solid #38b2ac;">
                        <h4 style="margin: 0 0 15px 0; color: #234e52;">📋 추천 법규</h4>
                        <select multiple style="width: 100%; height: 200px; padding: 10px; border: 1px solid #cbd5e0; border-radius: 4px;">
                            ${recommendedLaws.map(law => `
                                <option value="${law}" ${selectedItems.includes(law) ? 'selected' : ''}>
                                    ${law}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 20px; color: #718096;">
                        해당하는 법규가 없습니다.
                    </div>
                `}
            `;
        }
        
        modal.style.display = 'block';
    }
    
    closeLegalBasisModal() {
        const modal = this.getElement('legalBasisModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    applyLegalBasis() {
        if (!this.currentAssessmentRow) return;
        
        const content = this.getElement('legalBasisContent');
        const selectElement = content.querySelector('select');
        
        if (selectElement) {
            const selectedOptions = Array.from(selectElement.selectedOptions);
            const selectedBasis = selectedOptions.map(option => option.value);
            
            // 법적 근거 저장 및 표시
            const legalBasisDisplay = this.currentAssessmentRow.querySelector('.legal-basis-display');
            const legalBasisData = this.currentAssessmentRow.querySelector('.legal-basis-data');
            
            legalBasisData.value = JSON.stringify(selectedBasis);
            
            if (selectedBasis.length > 0) {
                legalBasisDisplay.innerHTML = selectedBasis.map(item => 
                    `<div style="font-size: 0.8rem; margin: 3px 0; padding: 3px 6px; background: white; border-radius: 4px; border-left: 3px solid #667eea; word-break: break-word;">${item}</div>`
                ).join('');
            } else {
                legalBasisDisplay.innerHTML = '<span style="color: #a0aec0; display: flex; align-items: center; justify-content: center; height: 60px; text-align: center;">📋 클릭하여<br>법규 선택</span>';
            }
        }
        
        this.closeLegalBasisModal();
    }
    
    copyRow(sourceRow) {
        const rowData = this.collectRowData(sourceRow);
        rowData.cause = ''; // 원인은 비워둠
        rowData.currentState = ''; // 현재상태도 새로 입력
        rowData.possibility = '';
        rowData.severity = '';
        rowData.risk = '';
        
        this.createAssessmentRow(rowData);
        window.app.notificationManager.show('행이 복사되었습니다.', 'success');
    }
    
    deleteRow(row) {
        const tbody = row.parentElement;
        
        if (tbody.children.length > 1) {
            if (confirm('이 행을 삭제하시겠습니까?')) {
                row.remove();
                window.app.notificationManager.show('행이 삭제되었습니다.', 'success');
            }
        } else {
            window.app.notificationManager.show('최소 1개의 행은 유지되어야 합니다.', 'error');
        }
    }
    
    addAssessmentRow() {
        this.createAssessmentRow();
    }
    
    collectRowData(row) {
        try {
            return {
                workContent: row.cells[0].querySelector('textarea')?.value || '',
                classification: row.cells[1].querySelector('input')?.value || '',
                cause: row.cells[2].querySelector('textarea')?.value || '',
                hazard: row.cells[3].querySelector('textarea')?.value || '',
                legalBasis: JSON.parse(row.querySelector('.legal-basis-data')?.value || '[]'),
                currentState: row.cells[5].querySelector('textarea')?.value || '',
                possibility: row.cells[6].querySelector('select')?.value || '',
                severity: row.cells[7].querySelector('select')?.value || '',
                risk: row.cells[8].textContent === '-' ? '' : row.cells[8].textContent,
                measures: row.cells[9].querySelector('textarea')?.value || '',
                improvedRisk: row.cells[10].querySelector('select')?.value || '',
                improvementDate: row.cells[11].querySelector('input')?.value || '',
                completionDate: row.cells[12].querySelector('input')?.value || '',
                manager: row.cells[13].querySelector('input')?.value || '',
                note: row.cells[14].querySelector('textarea')?.value || ''
            };
        } catch (error) {
            console.error('행 데이터 수집 오류:', error);
            return {};
        }
    }
    
    getCategoryKoreanName(category) {
        const names = {
            'mechanical': '기계(설비)적 요인',
            'electrical': '전기적 요인',
            'chemical': '화학(물질)적 요인',
            'biological': '생물학적 요인',
            'ergonomic': '작업특성 요인',
            'other': '작업환경 요인'
        };
        return names[category] || category;
    }
    
    setupEventListeners() {
        // 평가 항목 추가 버튼
        const addButton = document.querySelector('[data-add-assessment]');
        if (addButton) {
            addButton.addEventListener('click', () => this.addAssessmentRow());
        }
        
        // 법규 모달 관련 버튼
        const closeLegalBtn = document.querySelector('button[onclick="closeLegalBasisModal()"]');
        if (closeLegalBtn) {
            closeLegalBtn.onclick = () => this.closeLegalBasisModal();
        }
        
        const applyLegalBtn = document.querySelector('button[onclick="applyLegalBasis()"]');
        if (applyLegalBtn) {
            applyLegalBtn.onclick = () => this.applyLegalBasis();
        }
    }
}

// window 객체에 함수 등록
window.closeLegalBasisModal = () => {
    if (window.app && window.app.tabs && window.app.tabs.assessment) {
        window.app.tabs.assessment.closeLegalBasisModal();
    }
};

window.applyLegalBasis = () => {
    if (window.app && window.app.tabs && window.app.tabs.assessment) {
        window.app.tabs.assessment.applyLegalBasis();
    }
};