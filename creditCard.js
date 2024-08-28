document.addEventListener('DOMContentLoaded', function() {
    const cardNumber = document.getElementById('cardNumber');
    const cardName = document.getElementById('cardName');
    const cardMonth = document.getElementById('cardMonth');
    const cardYear = document.getElementById('cardYear');
    const cardCvv = document.getElementById('cardCvv');
    const cardNumberDisplay = document.getElementById('cardNumberDisplay');
    const cardNameDisplay = document.getElementById('cardNameDisplay');
    const cardExpirationDisplay = document.getElementById('cardExpirationDisplay');
    const cardCvvDisplay = document.getElementById('cardCvvDisplay');
    const cardItem = document.getElementById('card-item');
    const focusElement = document.getElementById('focusElement');

    const currentYear = new Date().getFullYear();
    const cardTypeImg = document.getElementById('cardTypeImg');
    const cardTypeImgBack = document.getElementById('cardTypeImgBack');

    // Přidání možností pro měsíce
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i < 10 ? '0' + i : i;
        option.textContent = i < 10 ? '0' + i : i;
        cardMonth.appendChild(option);
    }

    // Přidání možností pro roky
    for (let i = currentYear; i <= currentYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        cardYear.appendChild(option);
    }

    function formatCardNumber(value) {
        const regex = /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/g;
        const onlyNumbers = value.replace(/[^\d]/g, '');
        return onlyNumbers.replace(regex, (regex, $1, $2, $3, $4) =>
            [$1, $2, $3, $4].filter(group => !!group).join(' ')
        );
    }

    function updateCardType(number) {
        let re = new RegExp("^4");
        if (number.match(re) != null) return "visa";
        re = new RegExp("^(34|37)");
        if (number.match(re) != null) return "amex";
        re = new RegExp("^5[1-5]");
        if (number.match(re) != null) return "mastercard";
        re = new RegExp("^6011");
        if (number.match(re) != null) return "discover";
        re = new RegExp('^9792');
        if (number.match(re) != null) return 'troy';
        return "visa"; // default type
    }

    // Event listeners
    cardNumber.addEventListener('input', function() {
        this.value = formatCardNumber(this.value);
        cardNumberDisplay.textContent = this.value || '#### #### #### ####';
        const cardType = updateCardType(this.value);
        cardTypeImg.src = `https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${cardType}.png`;
        cardTypeImgBack.src = cardTypeImg.src;
    });

    cardName.addEventListener('input', function() {
        cardNameDisplay.textContent = this.value || 'Full Name';
    });

    cardMonth.addEventListener('change', updateCardExpiration);
    cardYear.addEventListener('change', updateCardExpiration);

    function updateCardExpiration() {
        const month = cardMonth.value;
        const year = cardYear.value.slice(-2);
        cardExpirationDisplay.textContent = month && year ? `${month}/${year}` : 'MM/YY';
    }

    cardCvv.addEventListener('focus', function() {
        cardItem.classList.add('-active');
    });

    cardCvv.addEventListener('blur', function() {
        cardItem.classList.remove('-active');
    });

    cardCvv.addEventListener('input', function() {
        cardCvvDisplay.textContent = this.value || '***';
    });

    // Funkce pro animaci focusu
    function focusInput(e) {
        const targetRef = e.target.dataset.ref;
        const target = document.querySelector(`[data-ref="${targetRef}"]`);
        if (!target) return;

        const bounds = target.getBoundingClientRect();
        const cardBounds = cardItem.getBoundingClientRect();

        focusElement.style.width = `${bounds.width}px`;
        focusElement.style.height = `${bounds.height}px`;
        focusElement.style.transform = `translateX(${bounds.left - cardBounds.left}px) translateY(${bounds.top - cardBounds.top}px)`;
        focusElement.classList.add('-active');
    }

    function blurInput() {
        focusElement.classList.remove('-active');
    }

    // Přidání event listenerů pro focus a blur
    document.querySelectorAll('.card-input__input').forEach(input => {
        input.addEventListener('focus', focusInput);
        input.addEventListener('blur', blurInput);
    });
});