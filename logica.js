// ============================================================================
// FLEET CAROUSEL FUNCTIONALITY
// ============================================================================

class FleetCarousel {
    constructor() {
        this.container = document.getElementById('fleet-carousel-cards-structure');
        this.prevBtn = document.getElementById('fleet-prev');
        this.nextBtn = document.getElementById('fleet-next');
        this.cardWidth = 0;
        this.gap = 0;
        this.currentPosition = 0;
        
        if (this.container && this.prevBtn && this.nextBtn) {
            this.init();
        }
    }
    
    init() {
        this.updateDimensions();
        this.attachEventListeners();
        window.addEventListener('resize', () => this.updateDimensions());
        this.container.addEventListener('scroll', () => {
            this.currentPosition = this.container.scrollLeft;
            this.updateButtonStates();
        });
        this.updateButtonStates();
    }
    
    updateDimensions() {
        const cards = this.container.querySelectorAll('.fleet-card-structure');
        if (cards.length === 0) return;
        
        const firstCard = cards[0];
        const styles = window.getComputedStyle(firstCard);
        
        // Get card width (including any margins)
        this.cardWidth = firstCard.offsetWidth;
        
        // Get gap from parent flex settings
        const parentStyles = window.getComputedStyle(this.container);
        this.gap = parseInt(parentStyles.gap) || 16; // Default gap
    }
    
    attachEventListeners() {
        this.prevBtn.addEventListener('click', () => this.scroll('prev'));
        this.nextBtn.addEventListener('click', () => this.scroll('next'));
    }
    
    scroll(direction) {
        const scrollAmount = this.cardWidth + this.gap;
        const containerWidth = this.container.parentElement.offsetWidth;
        const maxScroll = this.container.scrollWidth - containerWidth;
        
        let newPosition = this.container.scrollLeft;
        
        if (direction === 'next') {
            newPosition = Math.min(newPosition + scrollAmount, maxScroll);
        } else {
            newPosition = Math.max(newPosition - scrollAmount, 0);
        }
        
        this.container.scrollTo({
            left: newPosition,
            behavior: 'smooth'
        });
    }
    
    updateButtonStates() {
        const containerWidth = this.container.parentElement.offsetWidth;
        const maxScroll = this.container.scrollWidth - containerWidth;
        const currentScroll = this.container.scrollLeft;
        
        // Disable prev button at start
        this.prevBtn.disabled = currentScroll <= 0;
        
        // Disable next button at end (with 10px tolerance)
        this.nextBtn.disabled = currentScroll >= maxScroll - 10;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FleetCarousel();
});

// ============================================================================
// SEARCH FORM FUNCTIONALITY
// ============================================================================

const searchForm = document.getElementById('search-form');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        const pickupLocation = document.getElementById('pickup-location')?.value;
        const pickupDate = document.getElementById('pickup-date')?.value;
        const pickupTime = document.getElementById('pickup-time')?.value;
        const returnDate = document.getElementById('return-date')?.value;
        const returnTime = document.getElementById('return-time')?.value;
        
        console.log({
            pickupLocation,
            pickupDate,
            pickupTime,
            returnDate,
            returnTime
        });
    });
}

// Handle checkbox for different return location
const differentLocationCheckbox = document.getElementById('different-location');
if (differentLocationCheckbox) {
    differentLocationCheckbox.addEventListener('change', (e) => {
        const returnSection = document.getElementById('return-section');
        if (returnSection) {
            returnSection.style.display = e.target.checked ? 'grid' : 'none';
        }
    });
}
