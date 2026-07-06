// booking.js - Add at the top of your file
const BOOKING_COOLDOWN = 60000; // 1 minute in milliseconds

document.addEventListener('DOMContentLoaded', function() {
    // Check if user has submitted recently
    const lastBookingTime = localStorage.getItem('lastBookingTime');
    const now = Date.now();
    
    if (lastBookingTime && (now - parseInt(lastBookingTime)) < BOOKING_COOLDOWN) {
        const remainingSeconds = Math.ceil((BOOKING_COOLDOWN - (now - parseInt(lastBookingTime))) / 1000);
        alert(`Please wait ${remainingSeconds} seconds before submitting another booking.`);
        // Disable the form or show a message
        document.getElementById('submitBtn').disabled = true;
        setTimeout(() => {
            document.getElementById('submitBtn').disabled = false;
        }, BOOKING_COOLDOWN - (now - parseInt(lastBookingTime)));
    }

    // In your submit handler, AFTER successful submission:
    localStorage.setItem('lastBookingTime', Date.now().toString());
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const successMessage = document.getElementById('successMessage');

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 1. Collect form data
        const formData = {
            eventType: document.getElementById('bk-type').value,
            eventDate: document.getElementById('bk-date').value,
            eventVenue: document.getElementById('bk-venue').value.trim(),
            guestCount: parseInt(document.getElementById('bk-guests').value),
            cateringPackage: document.getElementById('bk-package').value,
            clientName: document.getElementById('bk-name').value.trim(),
            clientEmail: document.getElementById('bk-email').value.trim(),
            clientPhone: document.getElementById('bk-phone').value.trim(),
            specialRequests: document.getElementById('bk-notes').value.trim(),
            budget: document.getElementById('bk-budget').value,
            status: 'pending', // Default status
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 2. Validate required fields
        if (!formData.eventType || !formData.eventDate || !formData.guestCount || !formData.cateringPackage || !formData.clientName || !formData.clientEmail) {
            alert('Please fill in all required fields marked with *');
            return;
        }

        // 3. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.clientEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        // 4. Validate date (not in the past)
        const selectedDate = new Date(formData.eventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            alert('Please select a future date for your event');
            return;
        }

        // 5. Show loading state
        // submitBtn.disabled = true;
        // btnText.textContent = 'Submitting...';
        // btnSpinner.classList.remove('d-none');

        try {
            // 6. Save to Firestore
            console.log('📦 Data being sent:', formData);
            const docRef = await db.collection('bookings').add(formData);
            
            console.log('✅ Booking saved with ID:', docRef.id);
            
            // 7. Show success message
            // form.classList.add('d-none');
            // successMessage.classList.remove('d-none');
            
            // 8. (Optional) Send email notification via EmailJS
            // later

        } catch (error) {
            console.error('❌ Error saving booking:', error);
            // Check if it's a rate limit error
            if (error.code === 'permission-denied' && error.message.includes('createdAt')) {
                alert('You must wait 1 minute between booking requests. Please try again shortly.');
            } else {
                alert('Oops! Something went wrong. Please try again later.');
            }
                } 
        // finally {
        //     // 9. Reset button state
        //     submitBtn.disabled = false;
        //     btnText.textContent = '📩 Submit Booking Request';
        //     btnSpinner.classList.add('d-none');
        // }
    });
});