import { BaseTab } from './base-tab.js';

export class TitleTab extends BaseTab {
    constructor(dataManager) {
        super(dataManager);
        this.tabName = 'title';
    }
    
    render() {
        const data = this.dataManager.getData();
        
        // 회사 정보 표시
        this.setValue('companyName', data.company?.name);
        this.setValue('companyAddress', data.company?.address);
        this.setValue('companyTel', data.company?.tel);
        this.setValue('companyFax', data.company?.fax);
        
        // 연도 설정
        const yearElement = this.getElement('reportYear');
        if (yearElement && !yearElement.textContent) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    save() {
        // 회사 정보 저장
        this.dataManager.setData('company.name', this.getValue('companyName'));
        this.dataManager.setData('company.address', this.getValue('companyAddress'));
        this.dataManager.setData('company.tel', this.getValue('companyTel'));
        this.dataManager.setData('company.fax', this.getValue('companyFax'));
    }
}