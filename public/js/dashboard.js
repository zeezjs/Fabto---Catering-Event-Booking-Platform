document.addEventListener('DOMContentLoaded', async function () {
  if (typeof db === 'undefined') {
    console.error('Firestore db is not available. Make sure firebase-init.js loads before dashboard.js.')
    return
  }

  const tableBody = document.getElementById('bookingsTableBody')
  const countAll = document.getElementById('countAll')
  const countPending = document.getElementById('countPending')
  const countConfirmed = document.getElementById('countConfirmed')
  const countCompleted = document.getElementById('countCompleted')
  const countCancelled = document.getElementById('countCancelled')
  const searchInput = document.getElementById('bookingSearchInput')

  const detailPanel = document.getElementById('detailsPanel')
  const offcanvas = new bootstrap.Offcanvas(detailPanel)
  const statusSelect = detailPanel.querySelector('#status-select')
  const internalNotesTextarea = detailPanel.querySelector('#internal-notes')
  const saveChangesButton = detailPanel.querySelector('.detail-footer .btn-primary')

  let allBookings = []
  let selectedBookingId = null

  function getBookingData(doc) {
    return typeof doc.data === 'function' ? doc.data() : doc.data
  }

  function normalizeStatus(value) {
    if (!value) return 'Pending'
    const lower = value.toString().toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  function getBookingIndex(id) {
    return allBookings.findIndex((doc) => {
      if (!doc) return false
      if (doc.id === id) return true
      if (typeof doc.id === 'undefined' && getBookingData(doc)?.id === id) return true
      return false
    })
  }

  function updateLocalBooking(id, updates) {
    const index = getBookingIndex(id)
    if (index < 0) return
    const doc = allBookings[index]
    const data = getBookingData(doc) || {}
    allBookings[index] = { id, data: { ...data, ...updates } }
  }

  function filterBookings(bookings, query) {
    if (!query) return bookings
    const normalized = query.toLowerCase()
    return bookings.filter((doc) => {
      const data = getBookingData(doc) || {}
      const searchable = `${data.clientName || ''} ${data.clientEmail || ''}`.toLowerCase()
      return searchable.includes(normalized)
    })
  }

  function renderBookings(bookings) {
    tableBody.innerHTML = ''

    if (!bookings.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">No bookings match your search.</td></tr>'
      return
    }

    bookings.forEach((doc) => {
      tableBody.appendChild(buildRow(doc))
    })
  }

  function updateCounts(bookings = allBookings) {
    const counts = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }

    bookings.forEach((doc) => {
      const data = getBookingData(doc) || {}
      const status = (data.status || '').toLowerCase()
      if (status === 'pending') counts.pending += 1
      if (status === 'confirmed') counts.confirmed += 1
      if (status === 'completed') counts.completed += 1
      if (status === 'cancelled') counts.cancelled += 1
    })

    countAll.textContent = counts.all
    countPending.textContent = counts.pending
    countConfirmed.textContent = counts.confirmed
    countCompleted.textContent = counts.completed
    countCancelled.textContent = counts.cancelled
    document.getElementById('totalBookingsCount').textContent = counts.all
    document.getElementById('pendingBookingsCount').textContent = counts.pending
    document.getElementById('confirmedBookingsCount').textContent = counts.confirmed
    document.getElementById('upcomingBookingsCount').textContent = bookings.filter((doc) => {
      const data = getBookingData(doc) || {}
      const date = data.eventDate
      if (!date) return false
      const bookingDate = date.toDate ? date.toDate() : new Date(date)
      const now = new Date()
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return bookingDate >= now && bookingDate <= oneWeek
    }).length
  }

  const detailFields = {
    clientName: detailPanel.querySelector('.offcanvas-client-name'),
    statusBadge: detailPanel.querySelector('.detail-status-badge'),
    email: detailPanel.querySelector('.detail-email'),
    phone: detailPanel.querySelector('.detail-phone'),
    eventType: detailPanel.querySelector('.detail-type'),
    eventDate: detailPanel.querySelector('.detail-date'),
    guests: detailPanel.querySelector('.detail-guests'),
    venue: detailPanel.querySelector('.detail-venue'),
    package: detailPanel.querySelector('.detail-package'),
    budget: detailPanel.querySelector('.detail-budget'),
    message: detailPanel.querySelector('.detail-message')
  }

  const bookingDoc = {
    eventType: 'eventType',
    eventDate: 'eventDate',
    eventVenue: 'eventVenue',
    guestCount: 'guestCount',
    cateringPackage: 'cateringPackage',
    clientName: 'clientName',
    clientEmail: 'clientEmail',
    clientPhone: 'clientPhone',
    specialRequests: 'specialRequests',
    budget: 'budget',
    status: 'status',
    createdAt: 'createdAt'
  }

  function formatBookingDate(value) {
    if (!value) return '—'
    if (value instanceof Date) return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (value && value.toDate) return value.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return value
  }

  function buildRow(doc) {
    const data = getBookingData(doc) || {}
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="client-cell"><strong>${data.clientName || 'Unknown'}</strong><span>${data.clientEmail || 'No email'}</span></td>
      <td>${data.eventType || 'Unknown'}</td>
      <td>${formatBookingDate(data.eventDate)}</td>
      <td>${data.guestCount || '0'}</td>
      <td><span class="badge badge-${(data.status || 'pending').toLowerCase()}">${normalizeStatus(data.status)}</span></td>
      <td class="muted-cell">${formatBookingDate(data.createdAt) || '—'}</td>
      <td><button type="button" class="btn btn-link p-0 row-action" data-booking-id="${doc.id}">View →</button></td>
    `

    tr.querySelector('.row-action').addEventListener('click', function () {
      fillDetailPanel(doc.id, data)
      offcanvas.show()
    })

    return tr
  }

  function fillDetailPanel(id, data) {
    selectedBookingId = id
    const status = normalizeStatus(data.status)

    detailFields.clientName.textContent = data.clientName || 'Unknown'
    detailFields.statusBadge.textContent = status
    detailFields.statusBadge.className = `badge detail-status-badge badge-${(status || 'pending').toLowerCase()}`
    detailFields.email.textContent = data.clientEmail || '—'
    detailFields.phone.textContent = data.clientPhone || '—'
    detailFields.eventType.textContent = data.eventType || '—'
    detailFields.eventDate.textContent = formatBookingDate(data.eventDate)
    detailFields.guests.textContent = data.guestCount || '—'
    detailFields.venue.textContent = data.eventVenue || '—'
    detailFields.package.textContent = data.cateringPackage || '—'
    detailFields.budget.textContent = data.budget || '—'
    detailFields.message.textContent = data.specialRequests || 'No message provided.'

    statusSelect.value = status
    internalNotesTextarea.value = data.internalNotes || ''
  }

  saveChangesButton.addEventListener('click', async function () {
    if (!selectedBookingId) return

    const newStatus = normalizeStatus(statusSelect.value)
    const newNote = internalNotesTextarea.value.trim()

    try {
      await db.collection('bookings').doc(selectedBookingId).update({
        status: newStatus,
        internalNotes: newNote,
        updatedAt: new Date()
      })

      updateLocalBooking(selectedBookingId, {
        status: newStatus,
        internalNotes: newNote,
        updatedAt: new Date()
      })

      const visibleBookings = filterBookings(allBookings, searchInput.value)
      renderBookings(visibleBookings)
      updateCounts()

      detailFields.statusBadge.textContent = newStatus
      detailFields.statusBadge.className = `badge detail-status-badge badge-${newStatus.toLowerCase()}`
    } catch (error) {
      console.error('Unable to save booking changes:', error)
      alert('Unable to save changes. Please try again.')
    }
  })

  try {
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get()
    allBookings = snapshot.docs

    renderBookings(allBookings)
    updateCounts()

    searchInput.addEventListener('input', () => {
      const filtered = filterBookings(allBookings, searchInput.value)
      renderBookings(filtered)
    })
  } catch (error) {
    console.error('Error loading bookings:', error)
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-danger">Unable to load bookings.</td></tr>'
  }
})
