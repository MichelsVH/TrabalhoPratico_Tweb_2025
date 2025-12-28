// ============================================================================
// HAMBURGER MENU FUNCTIONALITY
// ============================================================================
const formContainer = document.getElementById('form-container');

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.querySelector('button[aria-label="Abrir o menu de navegação global"]');
    const mobileMenuCloseButton = document.querySelector('button[aria-label="Fechar o menu de navegação global"]');
    const mobileMenu = document.getElementById('mobile-menu');
    const differentLocationCheckbox = document.getElementById('different-location');
    const returnLocationField = document.getElementById('return-location-field');
    const carrosOption = document.getElementById('carros');
    const carrinhasOption = document.getElementById('carrinhas');
    const vehicleTypeInput = document.getElementById('vehicle-type');
    let menuOpen = false;
    
    const toggleMenu = () => {
        const hamburgerIcon = document.getElementById('hamburguer-icon');
        if (hamburgerIcon) {
            hamburgerIcon.classList.toggle('active');
        }
        
        menuOpen = !menuOpen;
        mobileMenu.classList.toggle('open');
        formContainer.style.display = menuOpen ? 'none' : 'flex';
        // Prevent body scroll when menu is open
        document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
    };
    
    // Toggle return location field visibility
    if (differentLocationCheckbox && returnLocationField) {
        differentLocationCheckbox.addEventListener('change', () => {
            returnLocationField.style.display = differentLocationCheckbox.checked ? 'flex' : 'none';
        });
    }

    // Vehicle type selector logic
    const setVehicleType = (type) => {
        if (vehicleTypeInput) {
            vehicleTypeInput.value = type;
        }
        if (carrosOption && carrinhasOption) {
            const isCar = type === 'carro';
            carrosOption.classList.toggle('active', isCar);
            carrinhasOption.classList.toggle('active', !isCar);
            carrosOption.setAttribute('aria-pressed', isCar);
            carrinhasOption.setAttribute('aria-pressed', !isCar);
        }
    };

    if (carrosOption && carrinhasOption) {
        carrosOption.addEventListener('click', () => setVehicleType('carro'));
        carrinhasOption.addEventListener('click', () => setVehicleType('carrinha'));

        carrosOption.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVehicleType('carro');
            }
        });

        carrinhasOption.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVehicleType('carrinha');
            }
        });

        // Ensure initial state is synced
        setVehicleType(vehicleTypeInput && vehicleTypeInput.value ? vehicleTypeInput.value : 'carro');
    }
    
    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', toggleMenu);
        
        // Close menu when clicking the close button
        if (mobileMenuCloseButton) {
            mobileMenuCloseButton.addEventListener('click', toggleMenu);
        }
        
        // Close menu when clicking on a link
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (menuOpen) {
                    toggleMenu();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerButton.contains(e.target) && !mobileMenu.contains(e.target) && menuOpen) {
                toggleMenu();
            }
        });
    }
});

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
// LOCATIONS TABS FUNCTIONALITY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const locationTabs = document.querySelectorAll('.location-tab');
    const locationColumns = document.querySelectorAll('.location-column');
    
    locationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and hide all columns
            locationTabs.forEach(t => t.classList.remove('active'));
            locationColumns.forEach(column => column.classList.remove('active'));
            
            // Add active class to clicked tab and show corresponding column
            tab.classList.add('active');
            const activeColumn = document.getElementById(tabName);
            if (activeColumn) {
                activeColumn.classList.add('active');
            }
        });
    });
});

// ============================================================================
// ABOUT SIXT TABS FUNCTIONALITY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const aboutTabs = document.querySelectorAll('.about-sixt-tab');
    const aboutColumns = document.querySelectorAll('.about-sixt-column');

    if (!aboutTabs.length || !aboutColumns.length) return;

    const setActive = (targetName) => {
        aboutTabs.forEach(tab => {
            const tabName = tab.getAttribute('data-tab');
            tab.classList.toggle('active', tabName === targetName);
        });

        aboutColumns.forEach(column => {
            const columnName = column.getAttribute('data-tab') || column.id;
            column.classList.toggle('active', columnName === targetName);
        });
    };

    // Ensure initial state is consistent
    const initial = aboutTabs[0].getAttribute('data-tab');
    setActive(initial);

    aboutTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetName = tab.getAttribute('data-tab');
            setActive(targetName);
        });
    });
});