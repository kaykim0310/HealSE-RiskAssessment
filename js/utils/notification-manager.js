export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification');
        if (!this.container) {
            this.createContainer();
        }
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification';
        this.container.className = 'notification';
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'success', duration = 3000) {
        this.container.textContent = message;
        this.container.className = `notification ${type}`;
        this.container.style.display = 'block';
        
        // 자동 숨김
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }
    
    hide() {
        this.container.style.display = 'none';
        
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }
    
    success(message, duration) {
        this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        this.show(message, 'info', duration);
    }
}