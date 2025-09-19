import { BaseTab } from './base-tab.js';

export class ClassificationTab extends BaseTab {
    constructor(dataManager) {
        super(dataManager);
        this.tabName = 'classification';
        this.currentHazardCategory = '';
        
        this.hazardLists = {
            mechanical: [
                '끼임 위험 부분 (감김, 끼임)',
                '위험한 표면 (절단, 베임, 긁힘)',
                '기계(설비)의 맞음, 뒤집힘, 무너짐, 넘어짐/깔림 위험 부분',
                '부딪힘 위험 부분',
                '넘어짐 (미끄러짐, 걸림, 헛디딤)',
                '떨어짐 위험 부분 (개구부 등)'
            ],
            electrical: [
                '감전 (안전전압 초과)',
                '아크',
                '정전기',
                '화재 / 폭발 위험'
            ],
            chemical: [
                '가스',
                '증기',
                '에어로졸․흄',
                '액체․미스트',
                '고체 (분진)',
                '반응성 물질',
                '방사선',
                '화재․폭발 위험',
                '복사열․폭발과압'
            ],
            biological: [
                '병원성 미생물, 바이러스에 의한 감염',
                '유전자 변형물질 (GMO)',
                '알러지 및 미생물',
                '동물',
                '식물'
            ],
            ergonomic: [
                '소음',
                '초음파․초저주파음',
                '진동',
                '근로자 실수(휴먼 에러)',
                '저압 또는 고압 상태',
                '질식 위험․산소결핍',
                '중량물 취급 작업',
                '반복 작업',
                '불안정한 작업 자세',
                '작업(조작) 도구'
            ],
            other: [
                '기후․고온․한랭',
                '조명',
                '공간 및 이동통로',
                '주변 근로자',
                '작업 시간',
                '조직 안전문화',
                '화상'
            ]
        };
    }
    
    render() {
        const data = this.dataManager.getData();
        
        // 공정 탭 생성
        this.createProcessTabs();
        
        // 현재 공정 선택
        this.selectProcess(data.currentProcessIndex || 0);
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    save() {
        // 현재 공정의 분류 데이터는 실시간으로 저장되므로 별도 저장 불필요
    }
    
    createProcessTabs() {
        const container = this.getElement('classificationProcessTabs');
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
        const tabs = document.querySelectorAll('#classificationProcessTabs button');
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
        const processNameDisplay = this.getElement('currentClassificationProcess');
        if (processNameDisplay) {
            processNameDisplay.textContent = process?.name || `공정 ${index + 1}`;
        }
        
        // 분류 데이터 로드
        this.loadClassificationData(process);
    }
    
    loadClassificationData(process) {
        if (!process) return;
        
        const classification = process.hazardClassification || {};
        
        Object.keys(this.hazardLists).forEach(category => {
            this.updateHazardDisplay(category, classification[category] || []);
        });
    }
    
    updateHazardDisplay(category, selectedHazards) {
        const container = this.getElement(`${category}-hazards`);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (selectedHazards.length === 0) {
            container.innerHTML = '<span style="color: #a0aec0; font-style: italic;">선택된 항목이 없습니다</span>';
        } else {
            selectedHazards.forEach(hazard => {
                const badge = this.createElement('span', {
                    textContent: hazard,
                    style: {
                        display: 'inline-block',
                        padding: '5px 12px',
                        background: '#e6fffa',
                        border: '1px solid #38b2ac',
                        borderRadius: '15px',
                        fontSize: '0.9rem',
                        color: '#234e52',
                        marginRight: '5px',
                        marginBottom: '5px'
                    }
                });
                container.appendChild(badge);
            });
        }
    }
    
    showHazardSelector(category) {
        this.currentHazardCategory = category;
        
        const modal = this.getElement('hazardSelectorModal');
        const title = this.getElement('modalTitle');
        const content = this.getElement('modalContent');
        
        if (!modal || !title || !content) return;
        
        // 카테고리명 설정
        const categoryNames = {
            'mechanical': '기계(설비)적 요인',
            'electrical': '전기적 요인',
            'chemical': '화학(물질)적 요인',
            'biological': '생물학적 요인',
            'ergonomic': '작업특성 요인',
            'other': '작업환경 요인'
        };
        
        title.textContent = categoryNames[category] + ' 선택';
        
        // 현재 선택된 항목
        const process = this.dataManager.getCurrentProcess();
        const selectedHazards = (process?.hazardClassification?.[category]) || [];
        
        // 체크박스 목록 생성
        content.innerHTML = '';
        
        const checkboxContainer = this.createElement('div', {
            style: {
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '10px',
                background: '#fafafa'
            }
        });
        
        this.hazardLists[category].forEach(hazard => {
            const label = this.createElement('label', {
                className: 'modal-checkbox-label',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    marginBottom: '5px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderRadius: '5px'
                }
            });
            
            const checkbox = this.createElement('input', {
                attributes: {
                    type: 'checkbox',
                    value: hazard
                }
            });
            
            if (selectedHazards.includes(hazard)) {
                checkbox.checked = true;
            }
            
            const text = this.createElement('span', {
                textContent: hazard,
                style: {
                    marginLeft: '10px'
                }
            });
            
            label.appendChild(checkbox);
            label.appendChild(text);
            checkboxContainer.appendChild(label);
        });
        
        content.appendChild(checkboxContainer);
        
        // 모달 표시
        modal.style.display = 'block';
    }
    
    closeHazardSelector() {
        const modal = this.getElement('hazardSelectorModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    applyHazardSelection() {
        const content = this.getElement('modalContent');
        if (!content) return;
        
        const checkboxes = content.querySelectorAll('input[type="checkbox"]:checked');
        const selectedHazards = Array.from(checkboxes).map(cb => cb.value);
        
        // 현재 공정에 저장
        const currentIndex = this.dataManager.getData().currentProcessIndex;
        const process = this.dataManager.getProcess(currentIndex);
        
        if (process) {
            if (!process.hazardClassification) {
                process.hazardClassification = {};
            }
            process.hazardClassification[this.currentHazardCategory] = selectedHazards;
            
            // 데이터 저장
            this.dataManager.updateProcess(currentIndex, 'hazardClassification', process.hazardClassification);
            
            // 화면 업데이트
            this.updateHazardDisplay(this.currentHazardCategory, selectedHazards);
        }
        
        // 모달 닫기
        this.closeHazardSelector();
    }
    
    setupEventListeners() {
        // 위험요인 선택 버튼들
        const categories = ['mechanical', 'electrical', 'chemical', 'biological', 'ergonomic', 'other'];
        
        categories.forEach(category => {
            const button = document.querySelector(`button[onclick="showHazardSelector('${category}')"]`);
            if (button) {
                button.onclick = () => this.showHazardSelector(category);
            }
        });
        
        // 모달 닫기 버튼
        const closeButton = document.querySelector('button[onclick="closeHazardSelector()"]');
        if (closeButton) {
            closeButton.onclick = () => this.closeHazardSelector();
        }
        
        // 적용 버튼
        const applyButton = document.querySelector('button[onclick="applyHazardSelection()"]');
        if (applyButton) {
            applyButton.onclick = () => this.applyHazardSelection();
        }
    }
}

// window 객체에 함수 등록
window.showHazardSelector = (category) => {
    if (window.app && window.app.tabs && window.app.tabs.classification) {
        window.app.tabs.classification.showHazardSelector(category);
    }
};

window.closeHazardSelector = () => {
    if (window.app && window.app.tabs && window.app.tabs.classification) {
        window.app.tabs.classification.closeHazardSelector();
    }
};

window.applyHazardSelection = () => {
    if (window.app && window.app.tabs && window.app.tabs.classification) {
        window.app.tabs.classification.applyHazardSelection();
    }
};