// booking.js
const BOOKING_COOLDOWN = 60000; // 1 minute in milliseconds
const EMAILJS_SERVICE_ID = 'service_79uc4dg'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'
const BOOKING_ALERT_EMAIL = 'fabtoventure@gmail.com'

function normalizeDateString(dateValue) {
  const date = new Date(dateValue)
  date.setHours(0, 0, 0, 0)
  return date.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
}

function isDateConflict(storedEventDate, normalizedTargetDate) {
  if (!storedEventDate) return false
  if (typeof storedEventDate === 'string') {
    return normalizeDateString(storedEventDate) === normalizedTargetDate
  }
  if (storedEventDate.toDate) {
    return normalizeDateString(storedEventDate.toDate()) === normalizedTargetDate
  }
  if (storedEventDate instanceof Date) {
    return normalizeDateString(storedEventDate) === normalizedTargetDate
  }
  return false
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form')
  const submitBtn = document.querySelector('.submit-btn')
  const buttonText = submitBtn.querySelector('.button-text')
  const btnSpinner = document.getElementById('btnSpinner')
  const conflictModal = new bootstrap.Modal(document.getElementById('bookingConflictModal'))

  if (!form) {
    console.error('Booking form not found.')
    return
  }

  const emailJsConfigured = EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
  if (emailJsConfigured) {
    emailjs.init(EMAILJS_PUBLIC_KEY)
  } else {
    console.warn('EmailJS is not configured. Email notifications will be skipped until you add your EmailJS keys.')
  }

  const lastBookingTime = localStorage.getItem('lastBookingTime')
  const now = Date.now()
  if (lastBookingTime && now - parseInt(lastBookingTime, 10) < BOOKING_COOLDOWN) {
    const remainingSeconds = Math.ceil((BOOKING_COOLDOWN - (now - parseInt(lastBookingTime, 10))) / 1000)
    alert(`Please wait ${remainingSeconds} seconds before submitting another booking.`)
    submitBtn.disabled = true
    setTimeout(() => {
      submitBtn.disabled = false
    }, BOOKING_COOLDOWN - (now - parseInt(lastBookingTime, 10)))
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault()

    const formData = {
      eventType: document.getElementById('bk-type').value,
      eventDate: document.getElementById('bk-date').value,
      eventVenue: document.getElementById('bk-venue').value.trim(),
      guestCount: parseInt(document.getElementById('bk-guests').value, 10),
      cateringPackage: document.getElementById('bk-package').value,
      clientName: document.getElementById('bk-name').value.trim(),
      clientEmail: document.getElementById('bk-email').value.trim(),
      clientPhone: document.getElementById('bk-phone').value.trim(),
      specialRequests: document.getElementById('bk-notes').value.trim(),
      budget: document.getElementById('bk-budget').value,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }

    if (!formData.eventType || !formData.eventDate || !formData.guestCount || !formData.clientName || !formData.clientEmail) {
      alert('Please fill in all required fields marked with *')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.clientEmail)) {
      alert('Please enter a valid email address')
      return
    }

    const selectedDate = new Date(formData.eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      alert('Please select a future date for your event')
      return
    }

    const normalizedDate = normalizeDateString(formData.eventDate)

    submitBtn.disabled = true
    buttonText.textContent = 'Checking availability...'
    btnSpinner.classList.remove('d-none')

    try {
      const snapshot = await db.collection('bookings').get()
      const hasConflict = snapshot.docs.some((doc) => {
        const storedDate = doc.data().eventDate
        return isDateConflict(storedDate, normalizedDate) && ['pending', 'confirmed'].includes((doc.data().status || '').toLowerCase())
      })

      if (hasConflict) {
        conflictModal.show()
        return
      }

      buttonText.textContent = 'Submitting booking...'

      const bookingPayload = {
        ...formData,
        eventDate: normalizedDate,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }

      const docRef = await db.collection('bookings').add(bookingPayload)
      console.log('✅ Booking saved with ID:', docRef.id)
      localStorage.setItem('lastBookingTime', Date.now().toString())
      form.reset()

      if (emailJsConfigured) {
        try {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: BOOKING_ALERT_EMAIL,
            event_type: bookingPayload.eventType,
            event_date: bookingPayload.eventDate,
            venue: bookingPayload.eventVenue,
            guest_count: bookingPayload.guestCount,
            package: bookingPayload.cateringPackage,
            client_name: bookingPayload.clientName,
            client_email: bookingPayload.clientEmail,
            client_phone: bookingPayload.clientPhone,
            budget: bookingPayload.budget,
            special_requests: bookingPayload.specialRequests,
            booking_id: docRef.id
          })
          console.log('✅ Email notification sent successfully')
        } catch (emailError) {
          console.error('EmailJS error:', emailError)
          alert('Booking submitted, but email notification could not be sent. Please check EmailJS configuration.')
          return
        }
      } else {
        console.warn('Skipping EmailJS send because EmailJS is not configured.')
      }

      alert('Your booking request has been submitted successfully. We will contact you soon.')
    } catch (error) {
      console.error('Booking error:', error)
      if (error.code === 'permission-denied' && error.message.includes('createdAt')) {
        alert('You must wait 1 minute between booking requests. Please try again shortly.')
      } else {
        alert('Oops! Something went wrong. Please try again later.')
      }
    } finally {
      submitBtn.disabled = false
      buttonText.textContent = 'Request Booking →'
      btnSpinner.classList.add('d-none')
    }
  })
})