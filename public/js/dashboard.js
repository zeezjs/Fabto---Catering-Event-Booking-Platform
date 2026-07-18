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

  const detailPanel = document.getElementById('detailsPanel')
  const offcanvas = new bootstrap.Offcanvas(detailPanel)
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
    const data = doc.data()
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="client-cell"><strong>${data.clientName || 'Unknown'}</strong><span>${data.clientEmail || 'No email'}</span></td>
      <td>${data.eventType || 'Unknown'}</td>
      <td>${formatBookingDate(data.eventDate)}</td>
      <td>${data.guestCount || '0'}</td>
      <td><span class="badge badge-${(data.status || 'pending').toLowerCase()}">${(data.status || 'Pending').toString().replace(/^(.)/, (m) => m.toUpperCase())}</span></td>
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
    detailFields.clientName.textContent = data.clientName || 'Unknown'
    detailFields.statusBadge.textContent = data.status ? data.status.toString().replace(/^(.)/, (m) => m.toUpperCase()) : 'Pending'
    detailFields.statusBadge.className = `badge detail-status-badge badge-${(data.status || 'pending').toLowerCase()}`
    detailFields.email.textContent = data.clientEmail || '—'
    detailFields.phone.textContent = data.clientPhone || '—'
    detailFields.eventType.textContent = data.eventType || '—'
    detailFields.eventDate.textContent = formatBookingDate(data.eventDate)
    detailFields.guests.textContent = data.guestCount || '—'
    detailFields.venue.textContent = data.eventVenue || '—'
    detailFields.package.textContent = data.cateringPackage || '—'
    detailFields.budget.textContent = data.budget || '—'
    detailFields.message.textContent = data.specialRequests || 'No message provided.'
  }

  function updateCounts(bookings) {
    const counts = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }

    bookings.forEach((doc) => {
      const status = (doc.data().status || '').toLowerCase()
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
      const date = doc.data().eventDate
      if (!date) return false
      const bookingDate = date.toDate ? date.toDate() : new Date(date)
      const now = new Date()
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return bookingDate >= now && bookingDate <= oneWeek
    }).length
  }

  try {
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get()
    const bookings = snapshot.docs

    tableBody.innerHTML = ''
    if (bookings.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">No bookings found.</td></tr>'
    } else {
      bookings.forEach((doc) => {
        tableBody.appendChild(buildRow(doc))
      })
    }

    updateCounts(bookings)
  } catch (error) {
    console.error('Error loading bookings:', error)
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-danger">Unable to load bookings.</td></tr>'
  }
})
