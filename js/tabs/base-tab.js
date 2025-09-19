export class BaseTab {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.tabName = '';
    }
    
    render() {
        // 하위 클래스에서 구현
        throw new Error('render() 메서드를 구현해야 합니다.');
    }
    
    save() {
        // 하위 클래스에서 구현
        throw new Error('save() 메서드를 구현해야 합니다.');
    }
    
    getElement(id) {
        return document.getElementById(id);
    }
    
    getValue(id) {
        const element = this.getElement(id);
        if (!element) return '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            return element.value || '';
        }
        
        return element.textContent || '';
    }
    
    setValue(id, value) {
        const element = this.getElement(id);
        if (!element) return;
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            element.value = value || '';
        } else {
            element.textContent = value || '';
        }
    }
    
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.attributes) {
            Object.keys(options.attributes).forEach(key => {
                element.setAttribute(key, options.attributes[key]);
            });
        }
        
        if (options.style) {
            Object.assign(element.style, options.style);
        }
        
        if (options.events) {
            Object.keys(options.events).forEach(event => {
                element.addEventListener(event, options.events[event]);
            });
        }
        
        return element;
    }
}