// ============================================================================
// CONSTANTS AND DATA
// ============================================================================
const formContainer = document.getElementById('form-container');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const VEHICLES = {
    carro: [
        { brand: 'Renault', model: 'Clio', image: 'imagens/renault-clio-5d-schwarz-2020.png' },
        { brand: 'Renault', model: 'Megane', image: 'imagens/renault-megane-kombi-blau-2018.png' },
        { brand: 'Renault', model: 'Captur', image: 'imagens/renault-captur-5d-blau-2020.png' },
        { brand: 'Volkswagen', model: 'Golf', image: 'imagens/2020-VW-Golf.png' },
        { brand: 'Toyota', model: 'Corolla', image: 'imagens/toyota-corolla.png' },
        { brand: 'Ford', model: 'Focus', image: 'imagens/ford-focus.png' },
        { brand: 'Seat', model: 'Leon', image: 'imagens/seat-leon.png' },
        { brand: 'Peugeot', model: '308', image: 'imagens/peugeot-308.png' },
    ],
    carrinha: [
        { brand: 'Renault', model: 'Trafic', image: 'imagens/renault-trafic-van-brown-2015.png' },
        { brand: 'Volkswagen', model: 'Transporter', image: 'imagens/vw-transporter.png' },
        { brand: 'Ford', model: 'Transit', image: 'imagens/ford-transit.png' },
        { brand: 'Mercedes-Benz', model: 'Vito', image: 'imagens/mercedes-benz-vito.png' },
        { brand: 'Peugeot', model: 'Expert', image: 'imagens/peugeot-expert.png' },
        { brand: 'Citroën', model: 'Jumpy', image: 'imagens/CITROEN_JUMPY.png' },
        { brand: 'Opel', model: 'Vivaro', image: 'imagens/opel-vivaro.png' },
        { brand: 'Fiat', model: 'Talento', image: 'imagens/fiat-talento-crew.png' },
    ],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const isWeekend = (date) => {
    const d = date.getDay();
    return d === 0 || d === 6; // Sunday=0, Saturday=6
};

const getDailyRate = (category, date) => {
    const weekend = isWeekend(date);
    if (category === 'carrinha') {
        return weekend ? 20 : 12;
    }
    return weekend ? 15 : 6; // carro
};

const enumerateDates = (start, end) => {
    const days = [];
    // Normalize to local date boundaries
    let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur <= endDate) {
        days.push(new Date(cur));
        cur = new Date(cur.getTime() + MS_PER_DAY);
    }
    return days;
};

const formatDate = (date) => {
    return date.toLocaleDateString('pt-PT', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' });
};

const calculatePrice = ({ category, pickupDT, returnDT, corporate, pickupLocation, returnLocation, differentReturn }) => {
    const days = enumerateDates(pickupDT, returnDT);
    let base = 0;
    const breakdown = [];
    days.forEach((day) => {
        const rate = getDailyRate(category, day);
        base += rate;
        breakdown.push({ label: `${formatDate(day)} (${isWeekend(day) ? 'Fim de semana' : 'Semana'})`, value: rate });
    });

    const daysCount = days.length;
    let discountRate = 0;
    if (corporate) {
        discountRate = daysCount < 3 ? 0.10 : 0.20;
    }
    const discount = Math.round((base * discountRate) * 100) / 100;

    const oneWayFee = (differentReturn && pickupLocation.trim() !== '' && returnLocation.trim() !== '' && pickupLocation.trim() !== returnLocation.trim()) ? 30 : 0;

    const total = Math.round((base - discount + oneWayFee) * 100) / 100;
    return { daysCount, base, discountRate, discount, oneWayFee, total, breakdown };
};

const pickRandomFour = (arr) => {
    const copy = [...arr];
    // Fisher-Yates shuffle (partial)
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 4);
};

// ============================================================================
// HAMBURGER MENU FUNCTIONALITY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.querySelector('button[aria-label="Abrir o menu de navegação global"]');
    const mobileMenuCloseButton = document.querySelector('button[aria-label="Fechar o menu de navegação global"]');
    const mobileMenu = document.getElementById('mobile-menu');
    const differentLocationCheckbox = document.getElementById('different-location');
    const returnLocationField = document.getElementById('return-location-field');
    const carrosOption = document.getElementById('carros');
    const carrinhasOption = document.getElementById('carrinhas');
    const vehicleTypeInput = document.getElementById('vehicle-type');
    const corporateTariffCheckbox = document.getElementById('corporate-tariff');
    const searchForm = document.getElementById('search-form');
    const resultsContainer = document.getElementById('results-container');
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

    // --------------------------------------------------------------------
    // RESULTS RENDERING
    // --------------------------------------------------------------------
    const renderResults = ({ category, pickupLocation, returnLocation, differentReturn, pricing, vehicles }) => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        resultsContainer.setAttribute('aria-busy', 'true');

        const title = document.createElement('h3');
        title.textContent = `Resultados: ${category.charAt(0).toUpperCase() + category.slice(1)} (${pricing.daysCount} dia${pricing.daysCount > 1 ? 's' : ''})`;
        resultsContainer.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'results-grid';
        resultsContainer.appendChild(grid);

        vehicles.forEach((v, idx) => {
            const card = document.createElement('div');
            card.className = 'vehicle-card';

            const img = document.createElement('img');
            img.className = 'vehicle-image';
            img.src = v.image || 'imagens/background_img.jpg';
            img.alt = `${v.brand} ${v.model}`;
            card.appendChild(img);

            const name = document.createElement('div');
            name.className = 'vehicle-name';
            name.textContent = `${v.brand} ${v.model}`;

            const locations = document.createElement('div');
            locations.className = 'vehicle-locations';
            locations.textContent = differentReturn && returnLocation ? `${pickupLocation} → ${returnLocation}` : pickupLocation;

            const price = document.createElement('div');
            price.className = 'vehicle-price';
            price.innerHTML = `Total: <strong>${pricing.total.toFixed(2)}€</strong> <button type="button" class="details-toggle">ver detalhes</button>`;

            const details = document.createElement('div');
            details.className = 'price-details';
            details.style.display = 'none';

            const list = document.createElement('ul');
            pricing.breakdown.forEach(b => {
                const li = document.createElement('li');
                li.textContent = `${b.label}: ${b.value.toFixed(2)}€`;
                list.appendChild(li);
            });

            const subtotal = document.createElement('div');
            subtotal.className = 'detail-line';
            subtotal.textContent = `Subtotal: ${pricing.base.toFixed(2)}€`;

            const discount = document.createElement('div');
            discount.className = 'detail-line';
            discount.textContent = `Desconto empresarial (${(pricing.discountRate * 100).toFixed(0)}%): -${pricing.discount.toFixed(2)}€`;

            const oneWay = document.createElement('div');
            oneWay.className = 'detail-line';
            oneWay.textContent = `Taxa devolução em local diferente: ${pricing.oneWayFee.toFixed(2)}€`;

            const total = document.createElement('div');
            total.className = 'detail-total';
            total.textContent = `Total: ${pricing.total.toFixed(2)}€`;

            details.appendChild(list);
            details.appendChild(subtotal);
            if (pricing.discountRate > 0) details.appendChild(discount);
            if (pricing.oneWayFee > 0) details.appendChild(oneWay);
            details.appendChild(total);

            price.querySelector('.details-toggle').addEventListener('click', () => {
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });

            card.appendChild(name);
            card.appendChild(locations);
            card.appendChild(price);
            card.appendChild(details);
            grid.appendChild(card);
        });

        resultsContainer.setAttribute('aria-busy', 'false');
    };

    // --------------------------------------------------------------------
    // FORM SUBMIT
    // --------------------------------------------------------------------
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = (vehicleTypeInput?.value || 'carro');
            const pickupLocation = document.getElementById('pickup-location')?.value || '';
            const returnLocation = document.getElementById('return-location')?.value || '';
            const differentReturn = !!differentLocationCheckbox?.checked;
            const corporate = !!corporateTariffCheckbox?.checked;
            const pickupDT = new Date(document.getElementById('pickup-datetime')?.value);
            const returnDT = new Date(document.getElementById('return-datetime')?.value);

            if (!(pickupDT instanceof Date) || isNaN(pickupDT) || !(returnDT instanceof Date) || isNaN(returnDT) || returnDT < pickupDT) {
                alert('Por favor, selecione datas válidas (devolução após levantamento).');
                return;
            }

            const pricing = calculatePrice({ category, pickupDT, returnDT, corporate, pickupLocation, returnLocation, differentReturn });
            const pool = VEHICLES[category] || VEHICLES.carro;
            const vehicles = pickRandomFour(pool);

            renderResults({ category, pickupLocation, returnLocation, differentReturn, pricing, vehicles });
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