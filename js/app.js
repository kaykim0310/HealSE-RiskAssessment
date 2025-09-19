import { DataManager } from './core/data-manager.js';
import { LegalBasisManager } from './core/legal-basis-manager.js';
import { ExportManager } from './core/export-manager.js';
import { NotificationManager } from './utils/notification-manager.js';
import { TitleTab } from './tabs/title-tab.js';
import { ProcessTab } from './tabs/process-tab.js';
import { RiskInfoTab } from './tabs/risk-info-tab.js';
import { ClassificationTab } from './tabs/classification-tab.js';
import { AssessmentTab } from './tabs/assessment-tab.js';
import { ReductionTab } from './tabs/reduction-tab.js';
import { ImprovementTab } from './tabs/improvement-tab.js';

class RiskAssessmentApp {
    constructor() {
        this.dataManager = new DataManager();
        this.legalBasisManager = new LegalBasisManager();
        this.exportManager = new ExportManager();
        this.notificationManager = new NotificationManager();
        
        this.currentTab = null;
        this.tabs = {};
        
        this.init();
    }
    
    init() {
        this.initializeTabs();
        this.setupEventListeners();
        this.loadSavedData();
        
        // 앱을 전역으로 노출
        window.app = this;
    }
    
    initializeTabs() {
        this.tabs = {
            title: new TitleTab(this.dataManager),
            process: new ProcessTab(this.dataManager),
            riskInfo: new RiskInfoTab(this.dataManager),
            classification: new ClassificationTab(this.dataManager),
            assessment: new AssessmentTab(this.dataManager, this.legalBasisManager),
            reduction: new ReductionTab(this.dataManager),
            improvement: new ImprovementTab(this.dataManager)
        };
    }
    
    setupEventListeners() {
        // 네비게이션 탭 클릭 이벤트
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });
        
        // 법규 파일 업로드 이벤트
        const fileInput = document.getElementById('legalFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleLegalFileUpload(e.target.files[0]);
            });
        }
    }
    
    showTab(tabName) {
        // 현재 탭 저장
        if (this.currentTab && this.tabs[this.currentTab]) {
            this.tabs[this.currentTab].save();
        }
        
        // 모든 탭 숨기기
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 모든 네비게이션 탭 비활성화
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 선택된 탭 표시
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        const navTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
        if (navTab) {
            navTab.classList.add('active');
        }
        
        // 탭 렌더링
        if (this.tabs[tabName]) {
            this.tabs[tabName].render();
        }
        
        this.currentTab = tabName;
    }
    
    async handleLegalFileUpload(file) {
        if (!file) return;
        
        try {
            const loaded = await this.legalBasisManager.loadFromExcel(file);
            if (loaded) {
                this.notificationManager.show('법규 데이터가 성공적으로 로드되었습니다.', 'success');
                
                // Assessment 탭이 현재 활성화되어 있다면 다시 렌더링
                if (this.currentTab === 'assessment') {
                    this.tabs.assessment.render();
                }
            }
        } catch (error) {
            console.error('법규 파일 업로드 오류:', error);
            this.notificationManager.show('법규 파일 로드 중 오류가 발생했습니다.', 'error');
        }
    }
    
    loadSavedData() {
        const savedData = this.dataManager.loadData();
        if (savedData) {
            this.notificationManager.show('저장된 데이터를 불러왔습니다.', 'success');
        }
    }
    
    saveAndNext(currentTabName) {
        // 현재 탭 저장
        if (this.tabs[currentTabName]) {
            this.tabs[currentTabName].save();
        }
        
        // 데이터 저장
        this.dataManager.saveData();
        
        // 다음 탭으로 이동
        const tabOrder = ['title', 'process', 'riskInfo', 'classification', 'assessment', 'reduction', 'improvement'];
        const currentIndex = tabOrder.indexOf(currentTabName);
        
        if (currentIndex < tabOrder.length - 1) {
            const nextTab = tabOrder[currentIndex + 1];
            this.showTab(nextTab);
            this.notificationManager.show('저장되었습니다!', 'success');
        } else {
            this.notificationManager.show('모든 평가가 완료되었습니다!', 'success');
        }
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new RiskAssessmentApp();
});